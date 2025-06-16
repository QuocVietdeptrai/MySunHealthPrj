const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    email: String,
    address: String,
    updatedBy : String,
    slug: {
      type: String,
      slug: "fullName",
      unique: true
    },
    deleted: {
        type : Boolean,
        default : false 
    },
    deletedBy : String,
    deletedAt : Date
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const User = mongoose.model('User', schema, "users");

module.exports = User;
