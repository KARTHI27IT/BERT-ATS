const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  githubId: String,
  leetcodeId: String
});

const userSchemaModel = mongoose.model('user', userSchema);

// Export all models together
module.exports = {
  userSchemaModel 
};
