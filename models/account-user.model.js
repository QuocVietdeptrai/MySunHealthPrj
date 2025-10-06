const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    status: String,
    password: String,
    avatar: String,
    createdBy: String,
    updatedBy: String,
    deleted: {
      type: Boolean,
      default: false
    },
    slug : {
      type: String, 
      slug: "fullName",
      unique: true
    },
    deletedBy: String,
    deletedAt: Date
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const AccountUser = mongoose.model('AccountUser', schema, "accounts-user");

module.exports = AccountUser;
