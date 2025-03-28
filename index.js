const express = require('express')
const path = require('path')
const mongoose = require('mongoose');

require('dotenv').config()
mongoose.connect(process.env.DATABASE)


const Tour = mongoose.model('Tour', { 
  name: String,
  vehicle: String 
});


const app = express()
const port = 3000

// Thiết lập thư mục views 
app.set('views', path.join(__dirname,"views"));
app.set('view engine', 'pug')

// Nhúng file tĩnh muốn public lên 
app.use(express.static(path.join(__dirname,"public")));

app.get('/', (req, res) => {
  res.render("client/pages/home",{
    pageTitle:"Trang chủ"
  });
})
app.get('/tours', async (req, res) => {
  const tourList = await Tour.find({});
  console.log(tourList);

  res.render("client/pages/tour_list",{
        pageTilte:"Danh sách Tour" ,
        tourList: tourList
    });
  })

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})