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