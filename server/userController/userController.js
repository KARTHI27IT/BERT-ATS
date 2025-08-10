const userService = require("./userService");

// Create User
var userCreate = async (req, res) => {
  try {
    const result = await userService.userCreateService(req.body);
    if (result.status) {
      res.status(200).json({ status: true, message: result.message });
    } else {
      res.status(400).json({ status: false, message: result.message });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ status: false, message: "Error: " + error.message });
  }
};

// Login
var userLogin = async (req, res) => {
  try {
    const result = await userService.userLoginService(req.body);
    if (result.status) {
      res.status(200).json({ status: true, message: result.message, token: result.token, user: result.user });
    } else {
      res.status(400).json({ status: false, message: result.message });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ status: false, message: "Error: " + error.message });
  }
};

// Get User Details
var userDetails = async (req, res) => {
  try {
    console.log(req.body);
    const result = await userService.userDetailsService(req.body);
    if (result.status) {
      res.status(200).json({ status: true, message: result.message, user: result.user });
    } else {
      res.status(400).json({ status: false, message: result.message });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ status: false, message: "Error: " + error.message });
  }
};

// Resume Upload & ATS Scoring
var userResumeUpload = async (req, res) => {
  try {
    const filePath = req.file?.path;
    const originalname = req.file?.originalname;
    const role = req.body?.role;

    if (!filePath || !originalname || !role) {
      return res.status(400).json({ status: false, message: "Missing file or role." });
    }

    const result = await userService.userResumeUploadService({ filePath, originalname, role });

    if (result.status) {
      res.status(200).json({ status: true, message: result.message, ResumeResult: result.ResumeResult });
    } else {
      res.status(400).json({ status: false, message: result.message });
    }

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ status: false, message: "Error: " + error.message });
  }
};

var userUpdateLinks = async (req, res) => {
  try {
    console.log(req.body);
    const result = await userService.userUpdateLinksService(req.body);
    if (result.status) {
      res.status(200).json({ status: true, message: result.message});
    } else {
      res.status(400).json({ status: false, message: result.message });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ status: false, message: "Error: " + error.message });
  }
};

const fetchLeetcodeGithubStats = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const result = await userService.fetchLeetcodeGithubStatsService(req.body);
    
    if (result.status) {
      res.status(200).json(result.data);  // Return actual stats
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Error: " + error.message });
  }
};

const generateReport = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const result = await userService.generateReportService(req.body);
    console.log(result.report);
    if (result.status) {
      res.status(200).json(result.report);  // Send report
    } else {
      res.status(400).json({ error: result.message });  // Send error message
    }
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Error: " + error.message });
  }
};

// Multiple Resume Upload & ATS Scoring
var userMultipleResumeUpload = async (req, res) => {
  try {
    const files = req.files;
    const role = req.body?.role;

    if (!files || files.length === 0 || !role) {
      return res.status(400).json({ status: false, message: "Missing files or role." });
    }

    const results = await userService.analyzeMultipleResumesService(files, role);

    res.status(200).json({ status: true, message: "Resumes analyzed successfully", results });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ status: false, message: "Error: " + error.message });
  }
};




module.exports = {
  userCreate,
  userLogin,
  userDetails,
  userResumeUpload,
  userUpdateLinks,
  fetchLeetcodeGithubStats,
  generateReport,
  userMultipleResumeUpload
};
