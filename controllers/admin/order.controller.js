const Order = require("../../models/order.model");
const variableConfig = require("../../config/variable");
const City = require("../../models/cities.model");
const moment = require("moment")
module.exports.list = async (req, res) => {
  const find = {
    deleted:false
  }

  //Status order
  if (req.query.status) {
      find.status = req.query.status  
  }

  //Payment Method
  if (req.query.namePayment) {
      find.paymentMethod = req.query.namePayment
  }

  //Status Payment
  if (req.query.statusPayment) {
      find.paymentStatus = req.query.statusPayment
  }

  //Filter Date
  const FilterDate = {}

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

    console.log("name", keywordRegex)
    find.$or = [
        { orderCode: keywordRegex },
        { fullName: keywordRegex },
        { phone: keywordRegex },
        { "items.name": keywordRegex }
    ];
  }

  // Phân trang
  const limit = 6;

  let page = 1

  if (req.query.page) {
      const pageCurrent = parseInt(req.query.page);
      if (pageCurrent > 0) {
          page = pageCurrent
      }
  }

  const skip = (page - 1) * limit

  const totalOrder = await Order.find({
      deleted: false
  })

  const totalPage = Math.ceil(totalOrder.length / limit)

  const pagination = {
      skip: skip,
      totalOrder: totalOrder,
      totalPage: totalPage
  }
    const orderList = await Order
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limit)
    .skip(skip)

  for(const orderDetail of orderList){
    orderDetail.paymentMethodName = variableConfig.paymentMethod.find(item => item.value == orderDetail.paymentMethod).label;
    orderDetail.paymentStatusName = variableConfig.paymentStatus.find(item => item.value == orderDetail.paymentStatus).label;
    orderDetail.statusName = variableConfig.orderStatus.find(item => item.value == orderDetail.status).label;
    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm"); 
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format("DD/MM/YYYY"); 
  }
  res.render("admin/pages/order-list",{
    pageTitle:"Quản lý đơn hàng",
    orderList:orderList,
    pagination: pagination
  });
}

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const orderDetail = await Order.findOne({
      _id:id,
      deleted: false
    })
  for (const item of orderDetail.items) {
    const city = await City.findOne({
      _id: item.locationFrom
    })
    item.locationFromName = city.name
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }

    orderDetail.paymentMethodName = variableConfig.paymentMethod.find(item => item.value == orderDetail.paymentMethod).label;
    orderDetail.paymentStatusName = variableConfig.paymentStatus.find(item => item.value == orderDetail.paymentStatus).label;
    orderDetail.statusName = variableConfig.orderStatus.find(item => item.value == orderDetail.status).label;
    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("YYYY-MM-DDTHH:mm");
    res.render("admin/pages/order-edit",{
      pageTitle:`Đơn hàng: ${orderDetail.orderCode}`,
      orderDetail:orderDetail,
      paymentMethod:variableConfig.paymentMethod,
      paymentStatus:variableConfig.paymentStatus,
      orderStatus:variableConfig.orderStatus,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/order/list`)
  }
}
module.exports.editPatch = async (req, res) => {
try {
    const id = req.params.id;

    const order = await Order.findOne({
      _id: id,
      deleted: false
    });

    if(!order) {
      res.json({
        code: "error",
        message: "Thông tin đơn hàng không hợp lệ!"
      })
      return;
    }

    await Order.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    req.flash("success", "Cập nhật đơn hàng thành công!");

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Thông tin đơn hàng không hợp lệ!"
    })
  }

}

module.exports.deletePatch = async (req,res) => {
  try {
    const id = req.params.id;
    
    await Order.updateOne({
      _id:id
    },{
      deleted:true,
      deletedBy:req.account.id,
      deletedAt: Date.now()
    })

    req.flash("success","Xóa đơn hàng thành công !");
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

module.exports.trash = async (req, res) => {
  const find = {
    deleted:true
  }

  //Status order
  if (req.query.status) {
      find.status = req.query.status  
  }

  //Payment Method
  if (req.query.namePayment) {
      find.paymentMethod = req.query.namePayment
  }

  //Status Payment
  if (req.query.statusPayment) {
      find.paymentStatus = req.query.statusPayment
  }

  //Filter Date
  const FilterDate = {}

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

    console.log("name", keywordRegex)
    find.$or = [
        { orderCode: keywordRegex },
        { fullName: keywordRegex },
        { phone: keywordRegex },
        { "items.name": keywordRegex }
    ];
  }

  // Phân trang
  const limit = 6;

  let page = 1

  if (req.query.page) {
      const pageCurrent = parseInt(req.query.page);
      if (pageCurrent > 0) {
          page = pageCurrent
      }
  }

  const skip = (page - 1) * limit

  const totalOrder = await Order.find({
      deleted: true
  })

  const totalPage = Math.ceil(totalOrder.length / limit)

  const pagination = {
      skip: skip,
      totalOrder: totalOrder,
      totalPage: totalPage
  }
    const orderList = await Order
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limit)
    .skip(skip)

  for(const orderDetail of orderList){
    orderDetail.paymentMethodName = variableConfig.paymentMethod.find(item => item.value == orderDetail.paymentMethod).label;
    orderDetail.paymentStatusName = variableConfig.paymentStatus.find(item => item.value == orderDetail.paymentStatus).label;
    orderDetail.statusName = variableConfig.orderStatus.find(item => item.value == orderDetail.status).label;
    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm"); 
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format("DD/MM/YYYY"); 
  }
  res.render("admin/pages/order-trash",{
    pageTitle:"Thùng rác đơn hàng",
    orderList:orderList,
    pagination: pagination
  });
}

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;
    
    await Order.updateOne({
      _id: id
    }, {
      deleted: false
    })

    req.flash("success", "Khôi phục đơn hàng thành công!");

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
    
    await Order.deleteOne({
      _id: id
    })

    req.flash("success", "Đã xóa vĩnh viễn đơn hàng thành công!");

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
