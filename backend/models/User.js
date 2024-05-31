const mongoose = require("mongoose");

<<<<<<< HEAD
const UserSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  mnemonic: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
=======
// Define User Schema
const userSchema = new mongoose.Schema({
  password: { type: String, required: true },
  mnemonic: { type: String, required: true }
});

// Create User Model
const User = mongoose.model('User', userSchema);

module.exports = User;
>>>>>>> 09887c5c659fe63a6153c4e9c67c627caeab026d
