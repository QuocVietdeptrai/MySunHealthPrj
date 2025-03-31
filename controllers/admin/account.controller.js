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