const Category = require("../../models/category.model");
const Product = require("../../models/product.model");
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

  const totalRecord = await Product.countDocuments(find);
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

  const productList = await Product
    .find(find)
    .sort({
      position:"desc"
    })
    .limit(limitItems)
    .skip(skip)

    for (const item of productList) {
      if(item.createdBy){
        const infoAccountCreatedBy = await AccountAdmin.findOne({
          _id:item.createdBy
        })
        item.createdByFullName = infoAccountCreatedBy ? infoAccountCreatedBy.fullName : "Không xác định";
        // console.log(infoAccountCreatedBy)
      }
  
      if(item.updatedBy){
        const infoAccountUpdatedBy = await AccountAdmin.findOne({
          _id:item.createdBy
        })
         item.updatedByFullName = infoAccountUpdatedBy ? infoAccountUpdatedBy.fullName : "Không xác định";
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
  
  res.render("admin/pages/product-list",{
    pageTitle:"Quản lý sản phẩm",
    productList:productList,
    pagination:pagination,
    accountAdminList:accountAdminList,
    categoryList:categoryList,
    categoryTree:categoryTree
  });
}
module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted:false
  })

  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  res.render("admin/pages/product-create",{
    pageTitle:"Tạo sản phẩm",
    categoryList:categoryTree,
  });
}


module.exports.createPost = async (req, res) => {
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }else{
    const totalRecord = await Product.countDocuments({})
    req.body.position = totalRecord + 1;
  }
  
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;

  // Ảnh đại diện
  if (req.files && req.files.avatar) {
    req.body.avatar = req.files.avatar[0].path;
  } else {
    delete req.body.avatar;
  }

  // Ảnh phụ
  if (req.files && req.files.images && req.files.images.length > 0) {
    req.body.images = req.files.images.map(file => file.path);
  } else {
    delete req.body.images;
  }

  // Chuyển đổi số
  req.body.price = req.body.price ? parseInt(req.body.price) : 0;
  req.body.salePrice = req.body.salePrice ? parseInt(req.body.salePrice) : 0;
  req.body.stock = req.body.stock ? parseInt(req.body.stock) : 0;

  const newProduct = new Product(req.body);
  await newProduct.save();

  req.flash("success", "Tạo sản phẩm thành công!");
  console.log("BODY:", req.body);
  res.json({
    code: "success",
    message: "Tạo sản phẩm thành công!"
  });
};


module.exports.trash = async (req, res) => {
  const find = {
    deleted:true
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

  const totalRecord = await Product.countDocuments(find);
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

  const productList = await Product
    .find(find)
    .sort({
      position:"desc"
    })
    .limit(limitItems)
    .skip(skip)

    for (const item of productList) {
      if(item.createdBy){
        const infoAccountCreatedBy = await AccountAdmin.findOne({
          _id:item.createdBy
        })
        item.createdByFullName = infoAccountCreatedBy ? infoAccountCreatedBy.fullName : "Không xác định";
        // console.log(infoAccountCreatedBy)
      }
  
      if(item.updatedBy){
        const infoAccountUpdatedBy = await AccountAdmin.findOne({
          _id:item.createdBy
        })
         item.updatedByFullName = infoAccountUpdatedBy ? infoAccountUpdatedBy.fullName : "Không xác định";
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
  res.render("admin/pages/product-trash",{
    pageTitle:"Thùng rác sản phẩm",
    productList:productList,
    pagination:pagination,
    accountAdminList:accountAdminList,
    categoryList:categoryList,
    categoryTree:categoryTree
  });
}


module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const productDetail = await Product.findOne({
      _id: id,
      deleted: false
    })

    if(productDetail) {
      productDetail.departureDateFormat = moment(productDetail.departureDate).format("YYYY-MM-DD");

      const categoryList = await Category.find({
        deleted: false
      })
  
      const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  
      res.render("admin/pages/product-edit", {
        pageTitle: "Chỉnh sửa sản phẩm",
        categoryList: categoryTree,
        productDetail: productDetail
      })
    } else {
      res.redirect(`/${pathAdmin}/product/list`);
    }
  } catch (error) {
    res.redirect(`/${pathAdmin}/product/list`);
  }
}
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Product.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    req.body.updatedBy = req.account.id;


    // Ảnh đại diện
    if (req.files && req.files.avatar) {
      req.body.avatar = req.files.avatar[0].path;
    } else {
      delete req.body.avatar;
    }

    // Ảnh phụ
    if (req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map(file => file.path);
    } else {
      delete req.body.images;
    }

    // Chuyển đổi số
    req.body.price = req.body.price ? parseInt(req.body.price) : 0;
    req.body.salePrice = req.body.salePrice ? parseInt(req.body.salePrice) : 0;
    req.body.stock = req.body.stock ? parseInt(req.body.stock) : 0;


    await Product.updateOne({
      _id: id,
      deleted: false
    }, req.body)

    req.flash("success", "Cập nhật sản phẩm thành công!")

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
    
    await Product.updateOne({
      _id:id
    },{
      deleted:true,
      deletedBy:req.account.id,
      deletedAt: Date.now()
    })

    req.flash("success","Xóa sản phẩm thành công !");
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
    
    await Product.updateOne({
      _id: id
    }, {
      deleted: false
    })

    req.flash("success", "Khôi phục sản phẩm thành công!");

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
        await Product.updateMany({
          _id: { $in: ids }
        }, {
          deleted: false
        });
        req.flash("success", "Khôi phục thành công!");
        break;
      case "delete-destroy":
        await Product.deleteMany({
          _id: { $in: ids }
        });
        req.flash("success", "Xóa vĩnh viễn thành công!");
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
        await Product.updateMany({
          _id: { $in: ids }
        },{
          status:option
        })
        req.flash("success","Đổi trạng thái thành công !");
        break;
      case "delete":
        await Product.updateMany({
          _id:{ $in: ids}
        },{
          deleted:true,
          deletedBy:req.account.id,
          deletedAt:Date.now()
        })
        req.flash("success","Xóa sản phẩm thành công !");
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
