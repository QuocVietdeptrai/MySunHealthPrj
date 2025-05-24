const AccountAdmin = require("../../models/account-admin.model");
const bcrypt = require("bcryptjs");
module.exports.edit = (req, res) => {
    res.render("admin/pages/profile-edit",{
      pageTitle:"Thông tin cá nhân"
    });
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.account.id
    req.body.updatedBy = req.account.id;
    req.body.updatedAt = Date.now();
    if(req.file){
      req.body.avatar = req.file.path;
    }else{
      delete req.body.avatar
    }

    await AccountAdmin.updateOne({
      _id:id,
      deleted:false
    },req.body)
    req.flash("success","Cập nhật thông tin cá nhân thành công")
    res.json({
      code:"success"
    })
  } catch (error) {
    res.json({
      code:"error",
      message:error
    })
  }
}
module.exports.change_password = (req, res) => {
    res.render("admin/pages/profile-change-password",{
      pageTitle:"Đổi mật khẩu"
    });
}   
module.exports.change_passwordPatch = async (req, res) => {
  try {
    const id = req.account.id;
    req.body.updatedBy = req.account.id;
    req.body.updatedAt = Date.now();

    // Mã hóa mật khẩu với Bcryptjs
    const salt = await bcrypt.genSalt(10); //Tạo ra chuỗi ngẫu nhiên có 10 ký tự
    req.body.password = await bcrypt.hash(req.body.password, salt);
    await AccountAdmin.updateOne({
      _id:id,
      deleted:false
    },req.body)
    req.flash("success","Đổi mật khẩu thành công !")
    res.json({
      code:"success"
    })
  } catch (error) {
    res.json({
      code:"error",
      message:error
    })
  }
}