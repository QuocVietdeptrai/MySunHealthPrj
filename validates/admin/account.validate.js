const Joi = require('joi');
module.exports.registerPost = (req, res, next) => { 
    const schema = Joi.object({
        fullName: Joi.string()
            .required()
            .messages({
                "string.empty" : "Vui lòng nhập họ tên !"
            }),

        email: Joi.string()
            .required()
            .messages({  
                "string.empty" : "Vui lòng nhập email !"
            }),

        password: Joi.string()
            .required()
            .messages({
                "string.empty" : "Vui lòng nhập mật khẩu !"
            }),
    });
    const { error } = schema.validate(req.body);

    if(error){
        console.log(error);
        res.json({
            code:"error",
            message: "Lỗi!"
        });
        return;
    }


    next();
}