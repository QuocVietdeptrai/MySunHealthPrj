const express = require('express')
const path = require('path')
const app = express()
const port = 3000

// Thiết lập thư mục views 
app.set('views', path.join(__dirname,"views"));
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render("client/pages/home",{
    pageTitle:"Trang chủ1"
  });
})
app.get('/tours', (req, res) => {
    res.render("client/pages/tour_list",{
        pageTilte:"Danh sách Tour"
    });
  })

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})