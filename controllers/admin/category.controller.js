const Category = require("../../models/category.model");
const AccountAdmin = require("../../models/account-admin.model")
const categoryHelper = require("../../helpers/category.helper")
const moment = require('moment'); 

module.exports.list =async (req, res) => {
  const find = {
    deleted:false
  };
  
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



  const categoryList = await Category
    .find(find)
    .sort({
      position:"desc"
    })
  // console.log(categoryList);
  for (const item of categoryList) {
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

  // console.log(accountAdminList)
    res.render("admin/pages/category-list",{
      pageTitle:"Quản lý danh mục",
      categoryList : categoryList,
      accountAdminList:accountAdminList
      
    });
}
module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted:false
  })
  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  
  // console.log(categoryTree)
  res.render("admin/pages/category-create",{
    pageTitle:"Tạo danh mục",
    categoryList:categoryTree
  });
}
module.exports.createPost = async (req, res) => {
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }else{
    const totalRecord = await Category.countDocuments({})
    req.body.position = totalRecord + 1;
  }
  
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.avatar = req.file ? req.file.path : "";

  const newRecord = new Category(req.body);
  await newRecord.save();

  req.flash("success","Tạo danh mục thành công !");
  // console.log(req.body);
  res.json({
    code:"success"
  })
}
module.exports.edit = async (req, res) => {
  try {
    const categoryList = await Category.find({
      deleted:false
    })
    const categoryTree = categoryHelper.buildCategoryTree(categoryList);
    const id = req.params.id;
    const categoryDetail = await Category.findOne({
      _id:id,
      deleted:false
    })
    // console.log(categoryDetail)
    // console.log(categoryTree)
    res.render("admin/pages/category-edit",{
      pageTitle:"Chỉnh sửa danh mục",
      categoryList:categoryTree,
      categoryDetail:categoryDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/category/list`)
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }else{
    const totalRecord = await Category.countDocuments({})
    req.body.position = totalRecord + 1;
  }
  req.body.updatedBy = req.account.id;
  if(req.file){
    req.body.avatar=req.file.path;
  }else{
    delete req.body.avatar;
  }

  await Category.updateOne({
    _id:id ,  
    deleted:false
  },req.body)

  req.flash("success","Chỉnh sửa danh mục thành công !");
  // console.log(req.body);
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
module.exports.deletePatch = async (req,res) => {
  try {
    const id = req.params.id;
    
    await Category.updateOne({
      _id:id
    },{
      deleted:true,
      deletedBy:req.account.id,
      deletedAt: Date.now()
    })

    req.flash("success","Xóa danh mục thành công !");
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
module.exports.changeMultiPatch = async (req,res) => {
  try {
    const {option , ids} = req.body;
    switch (option) {
      case "active":
      case "inactive":
        await Category.updateMany({
          _id: { $in: ids }
        },{
          status:option
        })
        req.flash("success","Đổi trạng thái thành công !")
        break;
      case "delete":
        await Category.updateMany({
          _id: { $in: ids }
        },{
          deleted:true,
          deletedBy:req.account.id,
          deletedAt: Date.now()
        })
        req.flash("success","Xóa danh mục thành công !")
        break;
      default:
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