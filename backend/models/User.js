const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
  password: { type: String, required: true },
  mnemonic: { type: String, required: true }
});

// Create User Model
const User = mongoose.model('User', userSchema);

module.exports = User;
