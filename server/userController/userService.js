// userService.js

const { userSchemaModel } = require('./userModel'); // Adjust path if needed
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const multer = require('multer');
const { spawn } = require('child_process');
const User = userSchemaModel; // Alias for convenience
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_1234';

if (!GOOGLE_API_KEY) {
    console.warn("Warning: GOOGLE_GENERATIVE_AI_API_KEY not set. AI report generation will fail.");
}
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY); 


const userCreateService = async (UserDetails) => {
  try {
    const existingUser = await User.findOne({ email: UserDetails.email });
    if (existingUser) {
      return { status: false, message: "Email already registered." };
    }

    const newUser = new User({
      name: UserDetails.name,
      email: UserDetails.email,
      password: UserDetails.password, // Assumes password is already hashed by the controller
    });

    const savedUser = await newUser.save();
    if (!savedUser) {
      return { status: false, message: "Failed to register user." };
    }

    console.log(`${newUser.name} registered successfully`);
    return { status: true, message: "User registration successful!", user: savedUser };

  } catch (error) {
    console.error("Registration error:", error.message);
    return { status: false, message: "Server error during registration. Please try again later." };
  }
};


const userLoginService = async (UserDetails) => {
  try {
    const email = UserDetails.email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return { status: false, message: "Email not registered." };
    }


    if (user.password !== UserDetails.password) { 
      return { status: false, message: "Incorrect password." };
    }

    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return {
      status: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // Add other non-sensitive user fields if needed
      },
    };

  } catch (error) {
    console.error("Login error:", error.message);
    return { status: false, message: "Server error during login. Please try again later." };
  }
};


const userDetailsService = async (UserDetails) => {
  console.log("Fetching details for email:", UserDetails.email);
  try {
    // Select only necessary fields, exclude password
    const user = await User.findOne({ email: UserDetails.email }).select('-password');
    if (!user) {
      return { status: false, message: "User not found." };
    }

    return {
      status: true,
      message: "User details retrieved successfully.",
      user: user
    };

  } catch (error) {
    console.error("Fetch user details error:", error.message);
    return { status: false, message: "Server error while retrieving user details." };
  }
};



// --- RESUME & SCORING SERVICES ---

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
/**
 * Multer upload middleware.
 */
const upload = multer({ storage });

function getATSScore(text, role) {
  return new Promise((resolve, reject) => {
    // Ensure the path to your Python script is correct
    const scriptPath = path.join(__dirname, '../analyzer/score.py'); // Adjust path as needed
    const python = spawn('python', [scriptPath, text, role]); // Ensure 'python' command is available

    let result = '';
    let error = '';

    python.stdout.on('data', (data) => {
      result += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script error (code ${code}):`, error);
        return reject(new Error(`Python script error: ${error}`));
      }

      try {
        const output = JSON.parse(result.trim());
        if (output.success) {
          resolve(output);
        } else {
          reject(new Error(output.error || "Unknown error from Python script"));
        }
      } catch (parseError) {
        console.error('Raw Python output that failed to parse:', result);
        reject(new Error(`Failed to parse Python output: ${parseError.message}`));
      }
    });
  });
}


const userResumeUploadService = async ({ filePath, originalname, role }) => {
  const ext = path.extname(originalname).toLowerCase();
  console.log("Processing file:", filePath);

  try {
    let extractedText = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const result = await Tesseract.recognize(filePath, 'eng');
      extractedText = result.data.text;
    } else {
      return { status: false, message: 'Unsupported file format' };
    }

    console.log(`Extracted text length: ${extractedText.length} characters`);

    const scoreResult = await getATSScore(extractedText, role);

    fs.unlink(filePath, (err) => {
      if (err) console.warn('Warning: Failed to delete uploaded file:', err.message); // Use warn for non-critical
    });

    return {
      status: true,
      message: 'Resume analyzed successfully',
      ResumeResult: {
        text: extractedText,
        score: scoreResult.ensemble_score,
        confidence: scoreResult.confidence,
        scoreRange: scoreResult.score_range,
        medianScore: scoreResult.median_score,
        stdDev: scoreResult.std_dev,
        individualScores: scoreResult.individual_scores,
        model: role,
      }
    };

  } catch (error) {
    console.error('Error analyzing resume:', error.message);
    // Attempt cleanup even on error
    if (filePath) {
       fs.unlink(filePath, (err) => {
         if (err) console.warn('Warning: Failed to delete uploaded file after error:', err.message);
       });
    }
    return { status: false, message: 'Server error during resume analysis.', error: error.message }; // Include error for debugging
  }
};

// --- CODING STATS FETCHING (GraphQL FIRST) ---

async function fetchLeetcodeDataGraphQL(username) {
    const url = 'https://leetcode.com/graphql/';
    // --- Updated GraphQL Query based on current schema (as of late 2023/early 2024) ---
    const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
              realName
              aboutMe
              # Add other profile fields if needed later
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                # submissions # Not typically needed for score calc
              }
            }
            # Contest ranking info is available but structure might vary
            # userContestRanking {
            #   rating
            #   ranking
            #   attendedContestsCount
            # }
          }
        }
    `;
    // --- End of Updated Query ---

    const variables = { username };

    console.log(`Attempting to fetch LeetCode stats via GraphQL for: ${username}`);

    try {
        const response = await axios.post(url, {
            query,
            variables
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Check for GraphQL errors in the response body
        if (response.data.errors) {
            console.error('LeetCode GraphQL API Errors:', JSON.stringify(response.data.errors, null, 2));
            throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors.map(e => e.message))}`);
        }

        const data = response.data.data;
        console.log(`Raw GraphQL data received (relevant parts) for ${username}:`, JSON.stringify({ matchedUser: data?.matchedUser }, null, 2));

        if (!data?.matchedUser) {
             console.warn(`LeetCode user not found or data incomplete via GraphQL for username: ${username}`);
             return { status: 'error', message: 'User not found or data unavailable on LeetCode' };
        }

        // --- Process the Updated GraphQL data ---
        const matchedUser = data.matchedUser;
        const submitStatsGlobal = matchedUser.submitStatsGlobal;

        let totalSolved = 0;
        let easySolved = 0;
        let mediumSolved = 0;
        let hardSolved = 0;

        // Extract solved counts from submitStatsGlobal.acSubmissionNum
        if (submitStatsGlobal?.acSubmissionNum && Array.isArray(submitStatsGlobal.acSubmissionNum)) {
            submitStatsGlobal.acSubmissionNum.forEach(item => {
                // We are interested in the 'count' of 'ac' (Accepted) submissions
                if (item.difficulty === "All") {
                    totalSolved = item.count;
                } else if (item.difficulty === "Easy") {
                    easySolved = item.count;
                } else if (item.difficulty === "Medium") {
                    mediumSolved = item.count;
                } else if (item.difficulty === "Hard") {
                    hardSolved = item.count;
                }
            });
        } else {
             console.warn(`Unexpected or missing structure for submitStatsGlobal.acSubmissionNum for ${username}`);
        }

        // Extract ranking from profile (might be a string, convert to int)
        const rankingRaw = matchedUser.profile?.ranking;
        let ranking = null;
        if (rankingRaw !== null && rankingRaw !== undefined) {
            // Try to parse if it's a string representation of a number
            const parsedRanking = parseInt(rankingRaw, 10);
            if (!isNaN(parsedRanking)) {
                ranking = parsedRanking;
            } else {
                console.warn(`Could not parse ranking '${rankingRaw}' for user ${username} as integer.`);
                // ranking remains null
            }
        }

        const processedData = {
            username: matchedUser.username,
            ranking: ranking, // Could be null if not found/parsable
            totalSolved: totalSolved,
            easySolved: easySolved,
            mediumSolved: mediumSolved,
            hardSolved: hardSolved,
            // Add other fields if needed
        };

        console.log(`Successfully fetched and processed LeetCode stats via GraphQL for: ${username}`, processedData);
        return {
            status: 'success',
            data: processedData
        };

    } catch (error) {
        console.error(`Error fetching LeetCode data via GraphQL for ${username}:`, error.message);
        if (error.response) {
            console.error('GraphQL API Response Status:', error.response.status);

            console.error('GraphQL API Response Data (truncated):', JSON.stringify(error.response.data).substring(0, 500));
        }
        return { status: 'error', message: `GraphQL fetch failed: ${error.message}` };
    }
}


const fetchLeetcodeGithubStatsService = async (UserDetails) => {
  console.log("Fetching coding stats for:", UserDetails);
  const { githubId, leetcodeId } = UserDetails;

  let leetcodeDataResult = null;
  let githubDataResult = null;
  let leetcodeGraphQLError = null;
  // let leetcodeScrapingError = null; // Uncomment if scraping fallback is used

  try {
    // --- Attempt 1: Fetch from LeetCode using Updated GraphQL ---
    if (leetcodeId) {
      console.log(`Attempting to fetch LeetCode stats from updated GraphQL API for: ${leetcodeId}`);
      try {
        const graphqlResult = await fetchLeetcodeDataGraphQL(leetcodeId);
        if (graphqlResult.status === 'success' && graphqlResult.data) {
          leetcodeDataResult = graphqlResult.data;
          console.log(`Successfully fetched LeetCode stats from updated GraphQL for: ${leetcodeId}`);
        } else {
            throw new Error(graphqlResult.message || "Unknown GraphQL error");
        }
      } catch (graphqlError) {
        console.error(`LeetCode GraphQL Error for ${leetcodeId}:`, graphqlError.message);
        leetcodeGraphQLError = graphqlError.message;
      }
    }

    // --- Fetch GitHub Stats ---
    if (githubId) {
      console.log(`Attempting to fetch GitHub stats for: ${githubId}`);
      try {
        // Add a small delay to be respectful to GitHub API? (Not strictly necessary but polite)
        // await new Promise(resolve => setTimeout(resolve, 100));
        const githubResponse = await axios.get(`https://api.github.com/users/${githubId}`, {
             headers: {
                 'User-Agent': 'ResumeAnalyzerApp' // Or your app's name
             }
         });
        if (githubResponse.data) {
          githubDataResult = githubResponse.data;
          console.log(`Successfully fetched GitHub stats for: ${githubId}`);
        }
      } catch (githubError) {
        console.error(`GitHub API Error for ${githubId}:`, githubError.message);
        if (githubError.response) {
           console.error('GitHub API Response Status:', githubError.response.status);
           // console.error('GitHub API Response Data:', githubError.response.data);
        }
      }
    }

    // --- Compile Final Result ---
    // If both fail, return an error
    if (!leetcodeDataResult && !githubDataResult) {
       const errorMessage = `Failed to fetch data from both GitHub and LeetCode. ` +
                            `LeetCode GraphQL Error: ${leetcodeGraphQLError || 'N/A'}. `;
                            // + (leetcodeScrapingError ? `LeetCode Scraping Error: ${leetcodeScrapingError}.` : '');
       return {
         status: false,
         message: errorMessage
       };
    }

    const resultData = {
      leetcode: leetcodeDataResult ? {
        totalSolved: leetcodeDataResult.totalSolved,
        ranking: leetcodeDataResult.ranking,
        easySolved: leetcodeDataResult.easySolved,
        mediumSolved: leetcodeDataResult.mediumSolved,
        hardSolved: leetcodeDataResult.hardSolved
        // Add other fields from GraphQL result if used in scoring
      } : null,
      github: githubDataResult ? {
        publicRepos: githubDataResult.public_repos,
        followers: githubDataResult.followers,
        following: githubDataResult.following
        // Add other relevant fields as needed
      } : null
    };

    const successMessage = `Successfully fetched available stats.`;
    if (leetcodeGraphQLError) {
        const warningDetails = ` (LeetCode GraphQL Error: ${leetcodeGraphQLError})`;
        console.warn(successMessage + warningDetails);
    } else {
        console.log(successMessage);
    }

    return {
      status: true,
      message: successMessage,
      data: resultData // Ensure 'data' key is used here
    };

  } catch (error) {
    console.error('Unexpected Service Error fetching stats:', error.message);
    console.error(error.stack); // Log stack trace for debugging
    return {
      status: false,
      message: 'Unexpected server error while fetching coding stats.'
    };
  }
};

// --- AI REPORT GENERATION ---

const generateReportService = async (UserDetails) => {
  const { resumeText, scoreData, githubStats, leetcodeStats } = UserDetails;

  // Basic validation
  if (!GOOGLE_API_KEY) {
      return { status: false, message: 'AI report generation is disabled (API key not configured).' };
  }
  if (!resumeText || !scoreData) {
     return { status: false, message: 'Missing required data for report generation (resume text or score data)' };
  }

  // Construct a detailed prompt for the AI
  const prompt = `Generate a professional, well-structured analysis report for a job seeker based on the provided data.
Structure the report clearly with the following main sections:

1. Summary: A brief overall assessment.
2. Resume Strengths: Highlight positive aspects of the resume based on the ATS score and content.
3. Areas for Improvement: Constructive feedback related to the resume, ATS score, or missing elements.
4. GitHub Profile Evaluation (if data is provided): Analyze activity, contributions, repositories.
5. LeetCode Performance (if data is provided): Analyze problem-solving skills, difficulty levels, ranking.
6. Actionable Suggestions: Specific, prioritized recommendations for improving the candidate's profile.
7. Final Verdict: An overall rating or outlook.

Resume Content:
${resumeText.substring(0, 2000)}... [Content truncated if too long]

ATS Analysis Results:
- Score: ${scoreData.score}/100
- Confidence: ${scoreData.confidence}%
- Score Range (if available): ${scoreData.scoreRange ? `${scoreData.scoreRange[0]} - ${scoreData.scoreRange[1]}` : 'N/A'}
- Median Score (if available): ${scoreData.medianScore || 'N/A'}
- Standard Deviation (if available): ${scoreData.stdDev || 'N/A'}

GitHub Statistics (if available):
${githubStats ? JSON.stringify(githubStats, null, 2) : 'No GitHub data provided'}

LeetCode Statistics (if available):
${leetcodeStats ? JSON.stringify(leetcodeStats, null, 2) : 'No LeetCode data provided'}

Please ensure the report is encouraging yet honest, provides specific examples where possible, and avoids generic statements. Tailor the language for a technical professional.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2, // Low temperature for more factual report
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4000, // Increased token limit for longer report
      },
    });

    console.log("Sending prompt to AI (length: ", prompt.length, " chars)");
    const result = await model.generateContent(prompt);
   
    const response = await result.response;
     
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
       throw new Error("Received empty response from AI model");
    }

    return {
      status: true,
      report: text 
    };
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    console.error(error.stack);
    let userMessage = 'Failed to generate report using AI.';
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
        userMessage += ' (Please check API key configuration.)';
    } else if (error.message.includes('quota')) {
        userMessage += ' (Quota exceeded. Please try again later.)';
    }
    return {
      status: false,
      message: userMessage,
      error: error.message 
    };
  }
};

module.exports = {
  userCreateService,
  userLoginService,
  userDetailsService,
  userResumeUploadService,
  fetchLeetcodeGithubStatsService, 
  generateReportService,
  upload, 
};
