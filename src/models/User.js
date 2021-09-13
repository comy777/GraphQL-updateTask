const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  nombre: {
    type: String,
    requiired: true,
    trim: true,
  },
  email: {
    type: String,
    requiired: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  registro: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("User", UserSchema);
