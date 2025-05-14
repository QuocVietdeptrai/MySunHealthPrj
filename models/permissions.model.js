const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name:String
  }
);

const Permission = mongoose.model('Permission', schema, "permissions");

module.exports = Permission;
