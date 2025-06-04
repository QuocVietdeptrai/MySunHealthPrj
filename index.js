const express = require('express')
const path = require('path')
require('dotenv').config()
const dataBase = require("./config/database");
const clientRoutes = require("./routes/client/index.route");
const adminRoutes = require("./routes/admin/index.route");
const variableConfig = require("./config/variable");
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const session = require('express-session')

const app = express()
const port = 4000

// Kết nối database 
dataBase.connect();

// Thiết lập thư mục views 
app.set('views', path.join(__dirname,"views"));
app.set('view engine', 'pug')

// Nhúng file tĩnh muốn public lên 
app.use(express.static(path.join(__dirname,"public")));

// Tạo biến toàn cục trong file PUG 
app.locals.pathAdmin = variableConfig.pathAdmin;

// Tạo biến toàn cục trong các file backend
global.pathAdmin = variableConfig.pathAdmin;

// Cho phép gửi data lên dạng JSON
app.use(express.json());

// Sử dụng cookie-parser 
app.use(cookieParser("DSFSDSAASDC"))

// Nhúng flash 
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());


//Thiết lập đường dẫn
app.use("/",clientRoutes);
app.use(`/${variableConfig.pathAdmin}`, adminRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})