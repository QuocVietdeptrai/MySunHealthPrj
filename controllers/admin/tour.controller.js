const Category = require("../../models/category.model");
const City = require("../../models/cities.model");
const Tour = require("../../models/tour.model");
const AccountAdmin = require("../../models/account-admin.model");
const slugify = require('slugify');
const moment = require('moment'); 
const categoryHelper = require("../../helpers/category.helper")

module.exports.list = async (req, res) => {
  const find = {
    deleted:false
  };
  const categoryList = await Category.find({
    deleted:false
  })
  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  //Lọc theo trạng thái 
  if(req.query.status){
    find.status = req.query.status;
  }
  //Lọc theo người tạo
  if(req.query.createdBy){
    find.createdBy = req.query.createdBy;
  }
  // Lọc theo ngày tạo 
  const dateFilter = {}
  if(req.query.startDate){
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFilter.$gte = startDate;
  }
  if(req.query.endDate){
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFilter.$lte = endDate;
  }
  // console.log(dateFilter)
  if(Object.keys(dateFilter).length > 0){
    find.createdAt = dateFilter;
  }

  // Lọc theo danh mục
  if (req.query.category) {
    const selectedCategoryId = req.query.category;
    const allCategoryIds = [selectedCategoryId, ...categoryHelper.getAllChildCategoryIds(categoryList, selectedCategoryId)];
    find.category = { $in: allCategoryIds };
  }
  
  //Lọc theo giá
  if (req.query.price) {
    const priceFilter = {};
    switch (req.query.price) {
      case 'under_2m':
        priceFilter.$lte = 2000000
        break;
      case '2m_to_4m':
        priceFilter.$gte = 2000000
        priceFilter.$lte = 4000000
        break;
      case '4m_to_8m':
        priceFilter.$gte = 4000000
        priceFilter.$lte = 8000000
        break;
      case 'over_8m':
        priceFilter.$gte = 8000000
        break;
      default:
        break;
    }
    if (Object.keys(priceFilter).length > 0) {
      find.priceNewAdult = priceFilter
    }
  }

  // Phân trang
  const limitItems = 3;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }

  const totalRecord = await Tour.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);

  // Xử lý trường hợp không có bản ghi
  if (totalRecord === 0) {
    page = 1; // Đặt page về 1
  } else if (page > totalPage) {
    page = totalPage;
  }

  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // End phân trang 
  // Tìm kiếm 
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword,{
      lower:true
    });
    
    const keywordRegex = new RegExp(keyword);
    // console.log(keywordRegex)
    find.slug = keywordRegex;
  }
  // End Tìm Kiếm

  const tourList = await Tour
    .find(find)
    .sort({
      position:"desc"
    })
    .limit(limitItems)
    .skip(skip)

    for (const item of tourList) {
      if(item.createdBy){
        const infoAccountCreatedBy = await AccountAdmin.findOne({
          _id:item.createdBy
        })
        item.createdByFullName =infoAccountCreatedBy.fullName   
        // console.log(infoAccountCreatedBy)
      }
  
      if(item.updatedBy){
        const infoAccountUpdatedBy = await AccountAdmin.findOne({
          _id:item.createdBy
        })
        item.updatedByFullName =infoAccountUpdatedBy.fullName   
        // console.log(infoAccountUpdatedBy)
      } 
      item.createdAtFomat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
      item.updatedAtFomat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
    }
  //Danh sách tài khoản quản trị
  const accountAdminList = await AccountAdmin
    .find({})
    .select("id fullName");
  // console.log(tourList.length)
  // Thêm thông báo khi không có bản ghi
  const message = totalRecord === 0 ? "Không có bản ghi nào" : null;
  res.render("admin/pages/tour-list",{
    pageTitle:"Quản lý tour",
    tourList:tourList,
    pagination:pagination,
    accountAdminList:accountAdminList,
    categoryList:categoryList,
    categoryTree:categoryTree,
    message:message
  });
}
module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted:false
  })

  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  const cityList = await City.find({})
  res.render("admin/pages/tour-create",{
    pageTitle:"Tạo tour",
    categoryList:categoryTree,
    cityList:cityList
  });
}
module.exports.createPost = async (req, res) => {
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }else{
    const totalRecord = await Tour.countDocuments({})
    req.body.position = totalRecord + 1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.avatar = req.file ? req.file.path : "";

  req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
  req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
  req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
  req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : req.body.priceAdult;
  req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : req.body.priceChildren;
  req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : req.body.priceBaby;
  req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
  req.body.stockChildren = req.body.stockAdult ? parseInt(req.body.stockChildren) : 0;
  req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
  req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
  req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
  req.body.schedules = req.body.locations ? JSON.parse(req.body.schedules) : [];

  const newRecord = new Tour(req.body);
  await newRecord.save();

  req.flash("success", "Tạo tour thành công!")


  res.json({
    code:"success",
    message:"Tạo tour thành công !"
  })
}

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true
  };
  const limitItems = 3;
    let page = 1;
    if(req.query.page){
      const currentPage = parseInt(req.query.page);
      if(currentPage > 0){
        page = currentPage;
      }
    }
    const totalRecord = await Tour.countDocuments(find);
    const totalPage = Math.ceil(totalRecord/limitItems);
    if(page > totalPage){
      page=totalPage
    }
    const skip = (page - 1)*limitItems;
    const pagination = {
      skip: skip,
      totalRecord: totalRecord,
      totalPage: totalPage
    }
    // End phân trang  
  // Tìm kiếm 
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword,{
      lower:true
    });
    
    const keywordRegex = new RegExp(keyword);
    // console.log(keywordRegex)
    find.slug = keywordRegex;
  }
  // End Tìm Kiếm
  const tourList = await Tour
    .find(find)
    .sort({
      deletedAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for (const item of tourList) {
    if(item.createdBy) {
      const infoAccountCreated = await AccountAdmin.findOne({
        _id: item.createdBy
      })
      item.createdByFullName = infoAccountCreated.fullName;
    }

    if(item.deletedBy) {
      const infoAccountDeleted = await AccountAdmin.findOne({
        _id: item.deletedBy
      })
      item.deletedByFullName = infoAccountDeleted.fullName;
    }

    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/tour-trash", {
    pageTitle: "Thùng rác tour",
    tourList: tourList,
    pagination:pagination
  })
}


module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false
    })

    if(tourDetail) {
      tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("YYYY-MM-DD");

      const categoryList = await Category.find({
        deleted: false
      })
  
      const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  
      const cityList = await City.find({});
  
      res.render("admin/pages/tour-edit", {
        pageTitle: "Chỉnh sửa tour",
        categoryList: categoryTree,
        cityList: cityList,
        tourDetail: tourDetail
      })
    } else {
      res.redirect(`/${pathAdmin}/tour/list`);
    }
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
}
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Tour.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    req.body.updatedBy = req.account.id;
    if(req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : req.body.priceAdult;
    req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : req.body.priceChildren;
    req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : req.body.priceBaby;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockAdult ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
    req.body.schedules = req.body.locations ? JSON.parse(req.body.schedules) : [];

    await Tour.updateOne({
      _id: id,
      deleted: false
    }, req.body)

    req.flash("success", "Cập nhật tour thành công!")

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }

}
module.exports.deletePatch = async (req,res) => {
  try {
    const id = req.params.id;
    
    await Tour.updateOne({
      _id:id
    },{
      deleted:true,
      deletedBy:req.account.id,
      deletedAt: Date.now()
    })

    req.flash("success","Xóa tour thành công !");
    res.json({
      code:"success"
    })
  } catch (error) {
    res.json({
      code:"error",
      message:"Id không hợp lệ !"
    })
  }
}

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;
    
    await Tour.updateOne({
      _id: id
    }, {
      deleted: false
    })

    req.flash("success", "Khôi phục tour thành công!");

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

module.exports.deleteDestroyPatch = async (req, res) => {
  try {
    const id = req.params.id;
    
    await Tour.deleteOne({
      _id: id
    })

    req.flash("success", "Đã xóa vĩnh viễn tour thành công!");

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
module.exports.trashChangeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "undo":
        await Tour.updateMany({
          _id: { $in: ids }
        }, {
          deleted: false
        });
        req.flash("success", "Khôi phục thành công!");
        break;
      case "delete-destroy":
        await Tour.deleteMany({
          _id: { $in: ids }
        });
        req.flash("success", "Xóa viễn viễn thành công!");
        break;
    }

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không tồn tại trong hệ thông!"
    })
  }
}

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const {option,ids} = req.body
    switch(option){
      case "active":
      case "inactive":
        await Tour.updateMany({
          _id: { $in: ids }
        },{
          status:option
        })
        req.flash("success","Đổi trạng thái thành công !");
        break;
      case "delete":
        await Tour.updateMany({
          _id:{ $in: ids}
        },{
          deleted:true,
          deletedBy:req.account.id,
          deletedAt:Date.now()
        })
        req.flash("success","Xóa tour thành công !");
        break;
    }
    
    res.json({
      code:"success"
    })
  } catch (error) {
    res.json({
      code:"error",
      message:"Id không tồn tại trong hệ thống !"
    })
  }
}
