const express = require('express')
const path = require('path')
const mongoose = require('mongoose');

require('dotenv').config()
mongoose.connect(process.env.DATABASE)

const clientRoutes = require("./routes/client/index.route");
const app = express()
const port = 3000

// Thiết lập thư mục views 
app.set('views', path.join(__dirname,"views"));
app.set('view engine', 'pug')

// Nhúng file tĩnh muốn public lên 
app.use(express.static(path.join(__dirname,"public")));


//Thiết lập đường dẫn
app.use("/",clientRoutes);
app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})