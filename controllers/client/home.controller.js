const Tour = require("../../models/tour.model");
const moment = require("moment");
const categoryHelper = require("../../helpers/category.helper");

module.exports.home = async (req, res) => {
  // Section 2
  const tourListSection2 = await Tour
    .find({
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(6)

  for(const item of tourListSection2) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // End Section 2
  
  //Section 4
  const categoryIdSection4 = "67ff5ef52e6105f2e8b38855";//id danh muc tour trong nuoc
  const listCategoryId = await categoryHelper.getAllSubcategoryIds(categoryIdSection4)
  const tourListSection4 = await Tour
    .find({
      category: {$in : listCategoryId},
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(8)

  for(const item of tourListSection4) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  //End Section 4
  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2,
    tourListSection4:tourListSection4
  })
}
