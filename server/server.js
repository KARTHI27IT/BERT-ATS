const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;
const mongoose = require("mongoose");
require('dotenv').config();

const userController = require("./userController/userController");
const { upload } = require("./userController/userService"); 

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

app.post("/user/signup", userController.userCreate);
app.post("/user/login", userController.userLogin);
app.post('/user/details', userController.userDetails);
app.post('/upload', upload.single('resume'), userController.userResumeUpload);
app.post('/updateuserlinks',userController.userUpdateLinks);
app.post('/generate-report',userController.generateReport);
app.post('/codestats',userController.fetchLeetcodeGithubStats);
app.post('/upload-multiple', upload.array('resumes'), userController.userMultipleResumeUpload);




app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
