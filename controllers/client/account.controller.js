const AccountUser = require("../../models/account-user.model");
const ForgotPassword = require("../../models/forgot-password.model")
const bcrypt = require("bcryptjs")
var jwt = require('jsonwebtoken');
const generateHelper = require("../../helpers/generate.helper");
const mailHelper = require("../../helpers/mail.helper");

module.exports.login = async (req, res) => {
  res.render("client/pages/login.pug", {
    pageTitle: "Đăng nhập người dùng"
  });
};
module.exports.loginPost = async (req, res) => {
  const { email , password , rememberPassword} = req.body;

  const existAccount = await AccountUser.findOne({
    email: email
  })

  if(!existAccount){
    res.json({
      code: "error",
      message: "Email không tồn tại trong hệ thống !"
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, existAccount.password);
  if(!isPasswordValid){
    res.json({
      code: "error",
      message: "Mật khẩu không đúng !"
    });
    return;
  }
  if(existAccount.status != "active"){
    res.json({
      code: "error",
      message: "Tài khoản của bạn đã bị khóa !"
    });
    return;
  }

  //Tạo JWT
  const token = jwt.sign(
    {
      id:  existAccount.id,
      email: existAccount.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberPassword ? '30d':'1d' //Token có thời hạn là 30 ngày hoặc 1 ngày
    }
  )

  // Lưu Token vào trong Cookie 
  res.cookie("token", token , {
    maxAge: rememberPassword ? (30 * 24 * 60 * 60 * 1000):(24 * 60 * 60 * 1000) , //Token có hiệu lực trong vòng 30 ngày hoặc 1 ngày
    httpOnly : true,
    sameSite : "strict"
  })

  res.json({
    code:"success",
    message:"Đăng nhập tài khoản thành công"
  });

};


module.exports.register = async (req, res) => {
  res.render("client/pages/register.pug", {
    pageTitle: "Đăng ký người dùng"
  });
};
module.exports.registerPost = async (req, res) => {
  const { fullName , email , password} = req.body;

  const existAccount = await AccountUser.findOne({
    email: email
  })

  if(existAccount){
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống !"
    });
    return;
  }

  // Mã hóa mật khẩu với Bcryptjs
  const salt = await bcrypt.genSalt(10); //Tạo ra chuỗi ngẫu nhiên có 10 ký tự
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAccount = new AccountUser({
    fullName: fullName,
    email: email ,
    password : hashedPassword ,
    status : "active"
  });

  await newAccount.save();

  res.json({
    code: "success",
    message: "Đăng ký tài khoản thành công"
  })
};

module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/forgot-password.pug", {
    pageTitle: "Quên mật khẩu người dùng"
  });
};
module.exports.forgot_passwordPost = async (req, res) => {
  const {email} = req.body;
  console.log(email);

  // Kiểm tra email xem có tồn tại hay không ? 
  const existAccount = await AccountUser.findOne({
    email: email
  });

  if(!existAccount){
    res.json({
      code:"error",
      message :"Email không tồn tại trong hệ thống !"
    });
    return;
  } 
  // Tạo mã OTP

  const otp = generateHelper.generateRandomNumber(6);
  console.log(otp);

  // Lưu vào database : email,otp và sau 5 phút sẽ tự động xóa bản ghi đó đi

  const newRecord = new ForgotPassword({
    email : email,
    otp : otp,
    expireAt : Date.now() + 5 * 60 * 1000
  })
  
  // Kiểm tra xem email đã tồn tại trong ForgotPassword
  const existForgotPassword = await ForgotPassword.findOne({
    email: email
  });

  if(existForgotPassword){
    res.json({
      code:"error",
      message :"Vui lòng gửi lại sau 5 phút !"
    });
    return;
  }

  await newRecord.save();
  // Gửi mã OTP qua email của người dùng tự động

  const subject = `Mã OTP lấy lại mật khẩu`;
  const content = `Mã OTP của bạn là <b style="color:green;">${otp}</b> . Mã có hiệu lực trong 5 phút và không được chia sẻ mã cho bất kỳ ai`
  mailHelper.sendMail(email,subject,content);



  res.json({
    code:"success",
    message:"Nhập mã OTP!"
  });
   
}

module.exports.otp_password = async (req, res) => {
  res.render("client/pages/otp-password",{
    pageTitle:"Nhập mã OTP "
  });
}

module.exports.otp_passwordPost = async (req, res) => {
  const {otp ,email} = req.body ;
  // Kiểm tra xem có tồn tài bản ghi trong ForgotPassword hay không 
  const existRecord = await ForgotPassword.findOne({
    otp : otp,
    email: email
  })

  if(!existRecord){
    res.json({
      code:"error",
      message :"Mã OTP không chính xác !"
    });
    return;
  }

  // Tìm thông tin người dùng trong AccoutAdmin 
  const account = await AccountUser.findOne({
    email : email
  })

  // Tạo JWT 
  const token = jwt.sign(
    {
      id:account.id,
      email:account.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d' //Token có thời hạn là 1 ngày
    }
  )

  // Lưu Token vào trong Cookie 
  res.cookie("token", token , {
    maxAge: 24 * 60 * 60 * 1000, //Token có hiệu lực trong vòng 1 ngày
    httpOnly : true,
    sameSite : "strict"
  })


  res.json({
    code:"success",
    message:"Xác thực OTP thành công!"
  });
}

module.exports.reset_password = async (req, res) => {
  res.render("client/pages/reset-password",{
    pageTitle:"Đổi mật khẩu"
  });
}

module.exports.reset_passwordPost = async (req, res) => {
  const {password} = req.body ;

  // Mã hóa mật khẩu với Bcryptjs
  const salt = await bcrypt.genSalt(10); //Tạo ra chuỗi ngẫu nhiên có 10 ký tự
  const hashedPassword = await bcrypt.hash(password, salt);
  
  await AccountUser.updateOne({
    _id: req.account.id,
    deleted: false,
    status : "active"
  },{
    password:hashedPassword
  })

  res.json({
    code:"success",
    message:"Đổi mật khẩu thành công !"
  });
}

module.exports.logoutPost = async (req, res) => {
  res.clearCookie("token")
  res.json({
    code:"success",
    message:"Đăng xuất tài khoản thành công"
  });
};