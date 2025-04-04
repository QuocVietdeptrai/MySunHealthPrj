const AccountAdmin = require("../../models/account-admin.model");

module.exports.login = (req, res) => {
    res.render("admin/pages/login",{
      pageTitle:"Đăng nhập"
    });
  }

module.exports.register = (req, res) => {
    res.render("admin/pages/register",{
      pageTitle:"Đăng ký"
    });
  }
module.exports.registerPost = async (req, res) => {
  const { fullName , email , password} = req.body;

  const existAccount = await AccountAdmin.findOne({
    email: email
  });

  if(existAccount){
    res.json({
      code:"error",
      message :"Email đã tồn tại trong hệ thống !"
    });
    return;
  }

  const newAccount = new AccountAdmin({
    fullName: fullName,
    email: email ,
    password : password ,
    status : "initial"
  });

  await newAccount.save();

  res.json({
    code:"success",
    message:"Đăng ký tài khoản thành công"
  });
}

module.exports.registerInitial = (req, res) => {
    res.render("admin/pages/register-initial",{
      pageTitle:"Tài khoản đã được khởi tạo"
    });
}
module.exports.forgot_password = (req, res) => {
    res.render("admin/pages/forgot-password",{
      pageTitle:"Quên mật khẩu"
    });
}
module.exports.otp_password = (req, res) => {
  res.render("admin/pages/otp-password",{
    pageTitle:"Nhập mã OTP "
  });
}
module.exports.reset_password = (req, res) => {
  res.render("admin/pages/reset-password",{
    pageTitle:"Đổi mật khẩu"
  });
}