const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model")
const City = require("../../models/cities.model");
const User = require("../../models/user.model");
const variableConfig = require("../../config/variable");
const gererateHelper = require("../../helpers/generate.helper");
const sortHelper = require("../../helpers/sort.helper");
const moment = require("moment");
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const mailHelper = require("../../helpers/mail.helper")
module.exports.createPost = async (req,res) => {
  try {
      req.body.orderCode = "OD" + gererateHelper.generateRandomNumber(10);
    // Danh sách tour 
    for (const item of req.body.items){
      const infoTour = await Tour.findOne({
        _id: item.tourId,
        status: "active",
        deleted : false
      })
      if(infoTour){
      //Thêm giá
      item.priceNewAdult = infoTour.priceNewAdult;
      item.priceNewChildren = infoTour.priceNewChildren;
      item.priceNewBaby = infoTour.priceNewBaby;
      // Ngày khởi hành
      item.departureDate = infoTour.departureDate;
      // Ảnh
      item.avatar = infoTour.avatar;
      // Tiêu đề
      item.name = infoTour.name;
      // Cập nhật lại số lượng còn lại của tour 
      if(infoTour.stockAdult < item.quantityAdult || infoTour.stockChildren < item.quantityChildren || infoTour.stockBaby < item.quantityBaby) {
        res.json({
          code: "error",
          message: `Số lượng chỗ của tour ${item.name} đã hết, vui lòng chọn lại`
        })
        return;
      }

      await Tour.updateOne({
        _id: item.tourId
      },{
        stockAdult: infoTour.stockAdult - item.quantityAdult,
        stockChildren: infoTour.stockChildren - item.quantityChildren,
        stockBaby: infoTour.stockBaby - item.quantityBaby
      })
      }
    }
    



    // Tổng tiền(tạm tính)
    req.body.subTotal = req.body.items.reduce((sum,item) => {
        return sum + ((item.priceNewAdult * item.quantityAdult) + (item.priceNewChildren * item.quantityChildren) + (item.priceNewBaby * item.quantityBaby));
    },0);
    // Gỉam
    req.body.discount = 0;
    // Thanh toán
    req.body.total = req.body.subTotal - req.body.discount;
    // Trạng thái thanh toán
    req.body.paymentStatus = "unpaid";
    // Trạng thái đơn hàng
    req.body.status = "initial";
    // console.log(req.body)
    const newOrder = new Order(req.body);
    await newOrder.save();

    // console.log("Body nhận được:", req.body);
    let user = await User.findOne({ phone: req.body.phone });
    if (!user) {
      user = new User({
        fullName: req.body.fullName,
        phone: req.body.phone,
        email: req.body.email
      });
      // console.log(User)
      await user.save();
    }
    const subject = `🎉 Cảm ơn bạn đã đặt tour tại VietTravel !`;
    const content = `
      <p>Xin chào <strong>${req.body.fullName}</strong>,</p>

      <p>Chúng tôi đã nhận được đơn đặt tour của bạn với mã đơn hàng: 
        <b style="color:green;">${req.body.orderCode}</b>.
      </p>

      <p>
        Tổng số tiền tạm tính: <strong>${req.body.total.toLocaleString("vi-VN")}₫</strong><br/>
        Hình thức thanh toán: <strong>Thanh toán sau</strong><br/>
        Trạng thái đơn hàng: <strong>Chờ xác nhận</strong>
      </p>

      <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận thông tin và hướng dẫn tiếp theo.</p>

      <p>Xin chân thành cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi!</p>

      <p>Trân trọng,<br/>
      Đội ngũ VietTravel</p>
    `;

    mailHelper.sendMail(req.body.email,subject,content);

    res.json({
        code: "success",
        message:"Đặt hàng thành công !",
        orderId:newOrder.id
    })
  } catch (error) {
    res.json({
      code:"error",
      message:"Đặt hàng không thành công !",
      
    })
  }
}
module.exports.success = async (req, res) => {
  try {
    const { orderCode, orderId, phone } = req.query;

    let orderDetail;

    // Trường hợp dùng orderCode (form check-order)
    if (orderCode) {
      orderDetail = await Order.findOne({
        orderCode: orderCode,
        deleted: false
      });
    }

    // Trường hợp dùng orderId + phone (form khác)
    else if (orderId && phone) {
      orderDetail = await Order.findOne({
        _id: orderId,
        phone: phone,
        deleted: false
      });
    }

    // Nếu không có thông tin nào phù hợp
    if (!orderDetail) {
      return res.redirect("/");
    }

    // Xử lý dữ liệu đơn hàng
    orderDetail.paymentMethodName = variableConfig.paymentMethod.find(
      item => item.value == orderDetail.paymentMethod
    )?.label || "Không xác định";

    orderDetail.paymentStatusName = variableConfig.paymentStatus.find(
      item => item.value == orderDetail.paymentStatus
    )?.label || "Không xác định";

    orderDetail.statusName = variableConfig.orderStatus.find(
      item => item.value == orderDetail.status
    )?.label || "Không xác định";

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY");

    for (const item of orderDetail.items) {
      const infoTour = await Tour.findOne({
        _id: item.tourId,
        deleted: false
      });

      if (infoTour) {
        item.slug = infoTour.slug;
      }

      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");

      const city = await City.findOne({
        _id: item.locationFrom
      });

      if (city) {
        item.locationFromName = city.name;
      }
    }

    res.render("client/pages/order-success", {
      pageTitle: "Đặt hàng thành công",
      orderDetail
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

module.exports.paymentZaloPay = async (req, res) => {
  try {
    const orderId = req.query.orderId;
  
    const orderDetail = await Order.findOne({
      _id: orderId,
      paymentStatus: "unpaid",
      deleted: false
    });

    if(!orderDetail) {
      res.redirect("/");
      return;
    }

    // APP INFO
    const config = {
      app_id: process.env.ZALOPAY_APPID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: `${process.env.ZALOPAY_DOMAIN}/v2/create`
    };

    const embed_data = {
      redirecturl: `${process.env.DOMAIN_WEBSITE}/order/success?orderId=${orderDetail.id}&phone=${orderDetail.phone}`
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: `${orderDetail.phone}-${orderDetail.id}`,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng ${orderDetail.orderCode}`,
      bank_code: "",
      callback_url: `${process.env.DOMAIN_WEBSITE}/order/payment-zalopay-result`
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, { params: order });
    if(response.data.return_code == 1) {
      res.redirect(response.data.order_url);
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/");
  }
}
module.exports.paymentZaloPayResult = async (req, res) => {
  const config = {
    key2:  process.env.ZALOPAY_KEY2
  };

  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);


    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    }
    else {
      // thanh toán thành công
      let dataJson = JSON.parse(dataStr, config.key2);
      const [ phone, orderId ] = dataJson.app_user.split("-");

      await Order.updateOne({
        _id: orderId,
        phone: phone,
        deleted: false
      }, {
        paymentStatus: "paid"
      })

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);

}

module.exports.paymentVNPay = async (req, res) => {
  try {
    const orderId = req.query.orderId;
  
    const orderDetail = await Order.findOne({
      _id: orderId,
      paymentStatus: "unpaid",
      deleted: false
    });

    if(!orderDetail) {
      res.redirect("/");
      return;
    }

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    
    let tmnCode = process.env.VNPAY_CODE;
    let secretKey = process.env.VNPAY_SECRET;
    let vnpUrl = process.env.VNPAY_URL;
    let returnUrl = `${process.env.DOMAIN_WEBSITE}/order/payment-vnpay-result`;
    let orderIdVNP = `${orderId}-${Date.now()}`;
    let amount = orderDetail.total;
    let bankCode = "";
    
    let locale = "vn";
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderIdVNP;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderIdVNP;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortHelper.sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl)
  } catch (error) {
    res.redirect("/");
  }
}

module.exports.paymentVNPayResult = async (req, res) => {
  let vnp_Params = req.query;

  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortHelper.sortObject(vnp_Params);

  let secretKey = process.env.VNPAY_SECRET;

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");     
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
  
  if(secureHash === signed){
    if(vnp_Params["vnp_ResponseCode"] == "00" && vnp_Params["vnp_TransactionStatus"] == "00") {
      const [ orderId, date ] = vnp_Params["vnp_TxnRef"].split("-");

      const orderDetail = await Order.findOne({
        _id: orderId,
        deleted: false
      });

      await Order.updateOne({
        _id: orderId,
        deleted: false
      }, {
        paymentStatus: "paid"
      })

      res.redirect(`${process.env.DOMAIN_WEBSITE}/order/success?orderId=${orderId}&phone=${orderDetail.phone}`);
    } else {
      res.render('success', {code: '97'})
    }
  } else{
    res.render('success', {code: '97'})
  }
}

