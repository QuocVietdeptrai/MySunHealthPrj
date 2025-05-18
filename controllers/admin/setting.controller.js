const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const Role = require("../../models/role.model")
const AccountAdmin = require("../../models/account-admin.model");
const permissionConfig = require("../../config/permission");
const slugify = require('slugify');
const bcrypt = require("bcryptjs");
const moment = require('moment'); 




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
    res.render("admin/pages/setting-role-create",{
      pageTitle:"Tạo nhóm quyền",
      permissionList: permissionConfig.permissionList
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
    res.render("admin/pages/setting-role-edit",{
      pageTitle:"Chỉnh sửa nhóm quyền",
      permissionList: permissionConfig.permissionList,
      listRoleDetail:listRoleDetail
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


module.exports.account_admin_list = async(req, res) => {
  const listRole = await Role.find({
    deleted:false
  })
  const find = {
    deleted:false
  }
  //Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  //Lọc theo quyền
  if(req.query.role){
    find.role = req.query.role
  }

  // Lọc theo ngày tạo
  const dateFilter = {};
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFilter.$lte = endDate;
  }
  if (Object.keys(dateFilter).length > 0) {
    find.createdAt = dateFilter;
  }

  //Tìm kiếm
  if(req.query.keyword) {
    const keyword = slugify(req.query.keyword, { lower: true });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
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

  const totalRecord = await AccountAdmin.countDocuments(find);
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
  // Thêm thông báo khi không có bản ghi
  const message = totalRecord === 0 ? "Không có bản ghi nào" : null;
  
  const accountAdminList = await AccountAdmin
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for(const item of accountAdminList) {
    if(item.role) {
      const roleInfo = await Role.findOne({
        _id: item.role
      });

      if(roleInfo) {
        item.roleName = roleInfo.name;
      }
    }
  }

  res.render("admin/pages/setting-account-admin-list",{
    pageTitle:"Tài khoản quản trị",
    accountAdminList:accountAdminList,
    listRole:listRole,
    pagination:pagination
  });
}
module.exports.account_admin_create = async (req, res) => {
  const listRole = await Role.find({
    deleted:false
  })
  res.render("admin/pages/setting-account-admin-create",{
    pageTitle:"Tài khoản quản trị",
    listRole:listRole
  });
}

module.exports.account_admin_createPost = async (req, res) => {
  const existAccount = await AccountAdmin.findOne({
    email: req.body.email
  })
  if(existAccount){
    res.json({
      code:"error",
      message:"Email đã tồn tại trong hệ thống !"
    })
    return;
  }
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.avatar = req.file ? req.file.path : "";

  // Mã hóa mật khẩu với Bcryptjs
  const salt = await bcrypt.genSalt(10); //Tạo ra chuỗi ngẫu nhiên có 10 ký tự
  req.body.password = await bcrypt.hash(req.body.password, salt);
  const newRecord = new AccountAdmin(req.body);
  await newRecord.save();
  req.flash("success","Tạo tài khoản quản trị thành công !");
  res.json({
    code:"success"
  })
} 

module.exports.account_admin_edit = async (req, res) => {
  try {
    const listRole = await Role.find({
    deleted:false
    })
    const id = req.params.id;
    const accountAdminDetail = await AccountAdmin.findOne({
      _id:id,
      deleted:false
    })
    res.render("admin/pages/setting-account-admin-edit",{
      pageTitle:"Chỉnh sửa tài khoản quản trị",
      listRole:listRole,
      accountAdminDetail:accountAdminDetail
    });
  } catch (error) {
    res.redirect(`${pathAdmin}/setting/account_admin/list`)
  }
}

module.exports.account_admin_editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    req.body.updatedBy = req.account.id;
    req.body.updatedAt = Date.now();
    if(req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }
    
    // Mã hóa mật khẩu với bcrypt
    if(req.body.password) {
      const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
      req.body.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu
    }

    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    req.flash('success', 'Cập nhật tài khoản quản trị thành công!');

    res.json({
      code: "success"
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/account_admin/list`);
  }

}
module.exports.account_admin_delete = async (req, res) => {
  try {
    const id = req.params.id;

    await AccountAdmin.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedBy:req.account.id,
      deletedAt:Date.now()
    });

    req.flash('success', 'Xóa tài khoản quản trị thành công!');

    res.json({
      code: "success"
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/account_admin/list`);
  }
}

module.exports.changeMultiAccountAdminPatch = async (req, res) => {
try {
    const {option , ids} = req.body;
    switch (option) {
      case "initial":
      case "active":
      case "inactive":
        await AccountAdmin.updateMany({
          _id: { $in: ids }
        },{
          status:option
        })
        req.flash("success","Đổi trạng thái thành công !")
        break;
      case "delete":
        await AccountAdmin.updateMany({
          _id: { $in: ids }
        },{
          deleted:true,
          deletedBy:req.account.id,
          deletedAt: Date.now()
        })
        req.flash("success","Xóa tài khoản quản trị thành công !")
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
