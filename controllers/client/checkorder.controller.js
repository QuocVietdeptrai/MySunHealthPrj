module.exports.checkOrder = async (req, res) => {
  res.render("client/pages/check-order", {
    pageTitle: "Kiểm tra đơn hàng"
  })
}