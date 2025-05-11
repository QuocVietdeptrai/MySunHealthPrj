const SettingWebsiteInfo = require("../../models/setting-website-info.model");
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
module.exports.role_list = (req, res) => {
    res.render("admin/pages/setting-role-list",{
      pageTitle:"Nhóm quyền"
    });
}
module.exports.role_create = (req, res) => {
    res.render("admin/pages/setting-role-create",{
      pageTitle:"Tạo nhóm quyền"
    });
}