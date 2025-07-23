const Category = require("../../models/category.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/cities.model");
const moment = require("moment");
const categoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  // Lấy slug từ params 
  const slug = req.params.slug;

  // Tìm theo slug
  const category = await Category.findOne({
    slug: slug,
    deleted: false,
    status: "active"
  });

  if (category) {
    // Breadcrumb
    const breadcrumb = {
      image: category.avatar,
      title: category.name,
      list: [
        {
          link: "/",
          title: "Trang Chủ"
        }
      ]
    };

    // Tìm danh mục cha
    if (category.parent) {
      const parentCategory = await Category.findOne({
        _id: category.parent,
        deleted: false,
        status: "active"
      });

      if (parentCategory) {
        breadcrumb.list.push({
          link: `/category/${parentCategory.slug}`,
          title: parentCategory.name
        });
      }
    }

    // Thêm danh mục hiện tại
    breadcrumb.list.push({
      link: `/category/${category.slug}`,
      title: category.name
    });
    // End Breadcrumb

    // Danh sách tour 
    const listCategoryId = await categoryHelper.getAllSubcategoryIds(category.id);
    const find = {
      category: { $in: listCategoryId },
      deleted: false,
      status: "active"
    };

    const totalTour = await Tour.countDocuments(find);

    const limit = 3;
    let page = 1;

    if (req.query.page) {
      const pageCurrent = parseInt(req.query.page);
      if (pageCurrent > 0) {
        page = pageCurrent;
      }
    }

    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalTour / limit);

    const pagination = {
      skip: skip,
      totalPage: totalPage,
      pageCurrent: page
    };

    const tourList = await Tour
      .find(find)
      .sort({ position: "desc" })
      .limit(limit)
      .skip(skip);

    for (const item of tourList) {
      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    }
    // Hết danh sách tour

    // Danh sách thành phố
    const cityList = await City.find({});
    // Hết danh sách thành phố

    res.render("client/pages/tour_list", {
      pageTitle: "Danh sách tour",
      breadcrumb: breadcrumb,
      category: category,
      tourList: tourList,
      totalTour: totalTour,
      cityList: cityList,
      pagination: pagination
    });
  } else {
    res.redirect("/");
  }
};
