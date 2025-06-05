const Tour = require("../../models/tour.model");
const Category = require("../../models/category.model");
const moment = require("moment");
const City = require("../../models/cities.model")

module.exports.detail = async (req, res) => {
  const slug = req.params.slug;
  // Tìm tour theo slug
  const tourDetail = await Tour.findOne({
    slug:slug,
    status:"active",
    deleted : false
  })
  // Hết tìm tour theo slug 
  if(tourDetail){
    const breadcrumb = {
      image: tourDetail.avatar,
      title: tourDetail.name,
      list: [
        {
          link: "/",
          title: "Trang Chủ"
        }
      ]
    };
    //Tìm theo slug
    const category = await Category.findOne({
      _id: tourDetail.category,
      deleted: false,
      status: "active"
    })  
    if(category){
    // Tìm danh mục cha cấp 1
    if(category.parent) {
      const parentCategory = await Category.findOne({
        _id: category.parent,
        deleted: false,
        status: "active"
      })

      if(parentCategory) {
        breadcrumb.list.push({
          link: `/category/${parentCategory.slug}`,
          title: parentCategory.name
        })
      }
    }

    // Thêm danh mục hiện tại cấp 2
    breadcrumb.list.push({
      link: `/category/${category.slug}`,
      title: category.name
    })
    // End Breadcrumb
    }
    breadcrumb.list.push({
      link: `/tour/detail/${slug}`,
      title: tourDetail.name
    })
    

    // Thông tin chi tiết
    tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("DD/MM/YYYY");
    const cityList = await City.find({
      _id: {$in: tourDetail.locations}
    })
    // Hết thông tin chi tiết 
    res.render("client/pages/tour-detail",{
      pageTitle:"Chi tiết tour",
      breadcrumb:breadcrumb,
      tourDetail:tourDetail,
      cityList:cityList
    });
  }else{
    res.redirect("/");
  }
}