const mongoose = require('mongoose');
module.exports.connect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log("Connect true");
      } catch (error) { 
        console.log("Connect false",error);
      }
    
}
