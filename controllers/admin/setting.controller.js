const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const Role = require("../../models/role.model")
const Permission = require("../../models/permissions.model")
const slugify = require('slugify');
module.exports.list = (req, res) => {
    res.render("admin/pages/setting-list",{
      pageTitle:"Cài đặt chung"
    });
}
module.exports.website_info = async (req, res) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
    res.render("admin/pages/setting-website-info",{
      pageTitle:"Thông tin website",
      settingWebsiteInfo:settingWebsiteInfo
    });
}
module.exports.website_infoPatch = async (req, res) => {
  if(req.files && req.files.logo) {
    req.body.logo = req.files.logo[0].path;
  } else {
    delete req.body.logo;
  }

  if(req.files && req.files.favicon) {
    req.body.favicon = req.files.favicon[0].path;
  } else {
    delete req.body.favicon;
  }
  // console.log(req.body)
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

  if(settingWebsiteInfo) {
    await SettingWebsiteInfo.updateOne({
      _id: settingWebsiteInfo.id
    }, req.body)
  } else {
    const newRecord = new SettingWebsiteInfo(req.body);
    await newRecord.save();
  }

  req.flash("success", "Cập nhật thành công!")

  res.json({
    code: "success"
  })

}
module.exports.account_admin_list = (req, res) => {
  res.render("admin/pages/setting-account-admin-list",{
    pageTitle:"Tài khoản quản trị"
  });
}
module.exports.account_admin_create = (req, res) => {
    res.render("admin/pages/setting-account-admin-create",{
      pageTitle:"Tài khoản quản trị"
    });
}
module.exports.role_list = async (req, res) => {
  const find = {
    deleted: false,
  };
  // Tìm kiếm 
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword,{
      lower:true
  });
  const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }
  // End Tìm Kiếm
  const listRole = await Role
    .find(find)
  // console.log(listRole)
  res.render("admin/pages/setting-role-list",{
    pageTitle:"Nhóm quyền",
    listRole:listRole
  });
}
module.exports.role_create = async (req, res) => {
  const listPermissions = await Permission.find({})
    res.render("admin/pages/setting-role-create",{
      pageTitle:"Tạo nhóm quyền",
      listPermissions:listPermissions
    });
}

module.exports.role_createPost = async (req, res) => {
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  const newRecord = new Role(req.body)
  await newRecord.save();

  req.flash("success","Tạo quyền thành công !")
  res.json({
    code:"success"
  })
}
module.exports.deletePatch = async (req,res) => {
  try {
    const id = req.params.id;
    
    await Role.updateOne({
      _id:id
    },{
      deleted:true,
      deletedBy:req.account.id,
      deletedAt: Date.now()
    })

    req.flash("success","Xóa quyền thành công !");
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

module.exports.editRole = async (req, res) => {
  try {
    const id = req.params.id;
    const listRoleDetail = await Role.findOne({
      _id:id,
      deleted:false
    })
    const listPermissions = await Permission.find({})
    console.log(listPermissions)
    res.render("admin/pages/setting-role-edit",{
      pageTitle:"Chỉnh sửa nhóm quyền",
      listRoleDetail:listRoleDetail,
      listPermissions:listPermissions
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/role/list`)
  }
}

module.exports.editRolePatch = async (req, res) => {
  try {
    const id = req.params.id;
    req.body.updatedBy=req.account.id
    await Role.updateOne({
        _id:id ,  
        deleted:false
      },req.body)
    req.flash("success","Cập nhật quyền thành công !")
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
module.exports.changeMultiRolePatch = async (req, res) => {
  try {
    const {ids,option} = req.body;
    if(option == "delete"){
      await Role.updateMany({
        _id:{ $in: ids}
      },{
        deleted:true,
        deletedBy:req.account.id,
        deletedAt:Date.now()
      })
      req.flash("success","Xóa tour thành công !");
  }
  res.json({
    code:"success"
  }) 
  } catch (error) {
    res.json({
      code:"error",
      message:"Id không tồn tại trong hệ thống"
    })
  }
}

