module.exports.list = (req, res) => {
    res.render("admin/pages/setting-list",{
      pageTitle:"Cài đặt chung"
    });
}
module.exports.website_info = (req, res) => {
    res.render("admin/pages/setting-website-info",{
      pageTitle:"Thông tin website"
    });
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