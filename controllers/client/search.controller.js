const Tour = require("../../models/tour.model");
const moment = require("moment");
const slugify = require('slugify');
module.exports.listSearch = async (req,res) => {
    const find = {
      status:"active",
      deleted: false
    };
    // Điểm đi 
    if(req.query.locationFrom){
      find.locations = req.query.locationFrom
    }
    // Hết điểm đi 
    //Điểm đến
    if(req.query.locationTo){
      const keyword = slugify(req.query.locationTo, { lower: true });
      const keywordRegex = new RegExp(keyword);
      find.slug = keywordRegex;
    }
    // Hết điểm đến

    // Ngày khởi hành
    if(req.query.departureDate){
      const date = new Date(req.query.departureDate);
      find.departureDate = date;
    }
    // Hết ngày khởi hành

    // Số lượng khách 
    if(req.query.stockAdult){
      find.stockAdult = {
        $gte:parseInt(req.query.stockAdult)
      }
    }
    if(req.query.stockChildren){
      find.stockChildren = {
        $gte:parseInt(req.query.stockChildren)
      }
    }
    if(req.query.stockBaby){
      find.stockBaby = {
        $gte:parseInt(req.query.stockBaby)
      }
    }
    // Hết số lượng khách

    // Số Tiền
    if(req.query.price){
      const [priceMin , priceMax]  = req.query.price.split("-").map(item => parseInt(item));
      find.priceNewAdult = {
        $gte:priceMin,
        $lte:priceMax
      }
    }
    // Hết Số Tiền
    const tourList = await Tour
      .find(find)
      .sort({
        position:"desc"
      })
    for(const item of tourList){
      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    }  
    res.render("client/pages/search", {
    pageTitle: "Kết quả tìm kiếm",
    tourList:tourList
  })
}