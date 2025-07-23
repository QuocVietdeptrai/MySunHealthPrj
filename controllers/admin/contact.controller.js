const moment = require("moment");
const Contact = require("../../models/contact.model");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  //Filter Date
  const FilterDate = {};

  //dateStart
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    FilterDate.$gte = startDate;
  }
  //dateEnd
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    FilterDate.$lte = endDate;
  }
  //object.keys(FilterDate) : trả về 1 mảng key

  if (Object.keys(FilterDate).length > 0) {
    find.createdAt = FilterDate;
  }
  // Tìm kiếm không theo slug
  if (req.query.keyword) {
    const keyword = req.query.keyword;
    const keywordRegex = new RegExp(keyword, "i"); // i = không phân biệt hoa thường

    console.log("name", keywordRegex);
    find.$or = [{ email: keywordRegex }, { "items.name": keywordRegex }];
  }
  // Phân trang
  const limitItems = 5;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }

  const totalRecord = await Contact.countDocuments(find);
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
  const contactList = await Contact.find(find)
    .sort({
      createdAt: "desc",
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/contact-list", {
    pageTitle: "Thông tin liên hệ",
    contactList: contactList,
    pagination: pagination,
  });
};

module.exports.deletePatch = async (req, res) => {
  // console.log("Chạy vào đây")
  // if (!req.permissions.includes("contact-delete")) {
  //   res.json({
  //     code: "error",
  //     message: "Không có quyền sử dụng tính năng này!",
  //   });
  //   console.log('Chạy vào if')
  //   return;
  // }
  try {
    console.log("Chạy vào try")
    const id = req.params.id;
    // deleted Model

    await Contact.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      }
    );

    req.flash("success", "Xóa thông tin liên hệ thành công!");

    res.json({
      code: "success",
    });
  } catch (error) {
    req.flash("error", "Xóa thông tin liên hệ thất bại!");
  }
};
module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Filter Date
  const FilterDate = {};

  //dateStart
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    FilterDate.$gte = startDate;
  }
  //dateEnd
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    FilterDate.$lte = endDate;
  }
  //object.keys(FilterDate) : trả về 1 mảng key

  if (Object.keys(FilterDate).length > 0) {
    find.createdAt = FilterDate;
  }
  // Tìm kiếm không theo slug
  if (req.query.keyword) {
    const keyword = req.query.keyword;
    const keywordRegex = new RegExp(keyword, "i"); // i = không phân biệt hoa thường

    console.log("name", keywordRegex);
    find.$or = [{ email: keywordRegex }, { "items.name": keywordRegex }];
  }
  // Phân trang
  const limitItems = 5;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }

  const totalRecord = await Contact.countDocuments(find);
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
  const listContactTrash = await Contact.find(find)
    .sort({
      createdAt: "desc",
    })
    .limit(limitItems)
    .skip(skip);
  for (const item of listContactTrash) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/contact-trash", {
    pageTitle: "Thùng rác thông tin liên hệ",
    listContactTrash: listContactTrash,
    pagination: pagination,
  });
};

module.exports.undoPatch = async (req, res) => {
  // if (!req.permissions.includes("contact-trash")) {
  //   res.json({
  //     code: "error",
  //     message: "Không có quyền sử dụng tính năng này!",
  //   });
  //   return;
  // }
  try {
    const id = req.params.id;
    await Contact.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      }
    );

    req.flash("success", "Khôi phục thành công!");

    res.json({
      code: "success",
    });
  } catch (error) {
    req.flash("error", "Khôi phục thất bại!");
  }
};
module.exports.deleteDestroyDelete = async (req, res) => {
    try {
    const id = req.params.id;
    
    await Contact.deleteOne({
      _id: id
    })

    req.flash("success", "Đã xóa vĩnh viễn liên hệ thành công!");

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

// Change Multil

// -------------- ChangeMulti -----------
module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "delete":
        await Contact.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: true,
            deletedBy: req.account.id,
            deletedAt: Date.now(),
          }
        );
        req.flash("success", "Xóa thành công!");
        break;
    }

    res.json({
      code: "success",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không tồn tại trong hệ thông!",
    });
  }
};

module.exports.trashChangeMultiPatch = async (req, res) => {
  // if (!req.permissions.includes("contact-trash")) {
  //   res.json({
  //     code: "error",
  //     message: "Không có quyền sử dụng tính năng này!",
  //   });
  //   return;
  // }
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "undo":
        await Contact.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: false,
          }
        );
        req.flash("success", "Khôi phục thành công!");
        break;
      case "delete-destroy":
        await Contact.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", "Xóa viễn viễn thành công!");
        break;
    }

    res.json({
      code: "success",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không tồn tại trong hệ thông!",
    });
  }
};
