const User = require("../../models/user.model");
const slugify = require('slugify');
module.exports.list = async (req, res) => {
  const find = {
    deleted: false
  }
  // Tìm kiếm 
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword,{
      lower:true
    });
    
    const keywordRegex = new RegExp(keyword);
    // console.log(keywordRegex)
    find.slug = keywordRegex;
  }
  // End Tìm Kiếm

  // Phân trang
  const limitItems = 2;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }

  const totalRecord = await User.countDocuments(find);
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
  // End phân trang 
  const listUser = await User
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)
  res.render("admin/pages/user-list",{
    pageTitle:"Quản lý người dùng",
    listUser:listUser,
    pagination:pagination
  });
}

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const userDetail = await User.findOne({
      _id:id,
      deleted: false
    })
    res.render("admin/pages/user-edit",{
    pageTitle:"Sửa người dùng",
    userDetail:userDetail
  });
  } catch (error) {
    res.redirect(`/${pathAdmin}/user/list`)
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const {email} = req.body;
    const existEmail = await User.findOne({
      email: email
    });
    if(existEmail){
        res.json({
            code:"error",
            message:"Email của bạn đã được đăng ký"
        });
        return;
    }
  
    req.body.updatedBy = req.account.id;
    await User.updateOne({
        _id:id ,  
        deleted:false
      },req.body)
    
    req.flash("success","Chỉnh sửa người dùng thành công !");
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

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    
    await User.updateOne({
      _id:id
    },{
      deleted:true,
      deletedBy:req.account.id,
      deletedAt: Date.now()
    })

    req.flash("success","Xóa người dùng thành công !");
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

module.exports.changeMultiPatch = async (req, res) => {
    try {
    const {option,ids} = req.body;
    if(option == "delete"){
      await User.updateMany({
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
      message:"Id không tồn tại trong hệ thống !"
    })
  }
}

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true
  };
  // Tìm kiếm 
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword,{
      lower:true
    });
    
    const keywordRegex = new RegExp(keyword);
    // console.log(keywordRegex)
    find.slug = keywordRegex;
  }
  // End Tìm Kiếm
  const limitItems = 3;
    let page = 1;
    if(req.query.page){
      const currentPage = parseInt(req.query.page);
      if(currentPage > 0){
        page = currentPage;
      }
    }
    const totalRecord = await User.countDocuments(find);
    const totalPage = Math.ceil(totalRecord/limitItems);
    // Xử lý trường hợp không có bản ghi
    if (totalRecord === 0) {
      page = 1; // Đặt page về 1
    } else if (page > totalPage) {
      page = totalPage;
    }
    const skip = (page - 1)*limitItems;
    const pagination = {
      skip: skip,
      totalRecord: totalRecord,
      totalPage: totalPage
    }
    // End phân trang  
  // Tìm kiếm 
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword,{
      lower:true
    });
    
    const keywordRegex = new RegExp(keyword);
    // console.log(keywordRegex)
    find.slug = keywordRegex;
  }
  // End Tìm Kiếm
  const listUser = await User
    .find(find)
    .sort({
      deletedAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)
  res.render("admin/pages/user-trash", {
    pageTitle: "Thùng rác người dùng",
    listUser: listUser,
    pagination: pagination
  })
}

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;
    
    await User.updateOne({
      _id: id
    }, {
      deleted: false
    })

    req.flash("success", "Khôi phục tour thành công!");

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}


module.exports.deleteDestroyPatch = async (req, res) => {
    try {
    const id = req.params.id;
    
    await User.deleteOne({
      _id: id
    })

    req.flash("success", "Đã xóa vĩnh viễn người dùng thành công!");

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

module.exports.trashChangeMultiPatch = async (req, res) => {
    try {
    const { option, ids } = req.body;

    switch (option) {
      case "undo":
        await User.updateMany({
          _id: { $in: ids }
        }, {
          deleted: false
        });
        req.flash("success", "Khôi phục thành công!");
        break;
      case "delete-destroy":
        await User.deleteMany({
          _id: { $in: ids }
        });
        req.flash("success", "Xóa viễn viễn thành công!");
        break;
    }

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không tồn tại trong hệ thông!"
    })
  }
}