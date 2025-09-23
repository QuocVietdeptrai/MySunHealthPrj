module.exports.login = async (req, res) => {
  res.render("client/pages/login.pug", {
    pageTitle: "Đăng nhập"
  });
};
