const Joi = require('joi');
module.exports.registerPost = (req, res, next) => { 
    const schema = Joi.object({
        fullName: Joi.string()
            .required()
            .min(5)
            .max(50)
            .messages({
                "string.empty" : "Vui lòng nhập họ tên !",
                "string.min" : "Họ tên phải ít nhất 5 kí tự",
                "string.max" : "Họ tên không được vượt quá 50 kí tự",
            }),

        email: Joi.string()
            .required()
            .email()
            .messages({  
                "string.empty" : "Vui lòng nhập email !",
                "string.email" : "Vui lòng nhập email đúng định dạng !"
            }),

        password: Joi.string()
            .required()
            .min(8)
            .custom((value, helpers) => {
                if(!/[A-Z]/.test(value)){
                    return helpers.error('password.uppercase');
                }
                if(!/[a-z]/.test(value)){
                    return helpers.error('password.lowercase');
                }
                if(!/\d/.test(value)){
                    return helpers.error('password.number');
                }
                if(!/[@$!%*?&]/.test(value)){
                    return helpers.error('password.special');
                }
                return value
            })
            .messages({
                "string.empty" : "Vui lòng nhập mật khẩu !",
                "string.min" : "Mật khẩu phải ít nhất có 8 ký tự !",
                "password.uppercase" : "Mật khẩu phải chứa ít nhất một chữ cái in hoa !",
                "password.lowercase" : "Mật khẩu phải chứa ít nhất một chữ cái in thường !",
                "password.number" : "Mật khẩu phải chứa ít nhất một số !",
                "password.special" : "Mật khẩu phải chứa ít nhất một ký tự đặc biệt! !"
            }),
    });
    const { error } = schema.validate(req.body);

    if(error){
        const errorMesage = error.details[0].message;
        res.json({
            code:"error",
            message: errorMesage
        });
        return;
    }


    next();
}