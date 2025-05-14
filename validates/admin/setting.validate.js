const Joi = require('joi');
module.exports.createPostWebstieInfo = (req, res, next) => { 
    const schema = Joi.object({
        websiteName: Joi.string()
            .required()
            .messages({
                "string.empty" : "Vui lòng nhập thông tin website !",
            }),
        phone : Joi.string().allow(""),
        email: Joi.string()
                    .required()
                    .email()
                    .messages({  
                        "string.empty" : "Vui lòng nhập email !",
                        "string.email" : "Vui lòng nhập email đúng định dạng !"
                    }),
        address : Joi.string().allow(""),
        logo : Joi.string().allow(""),
        favicon : Joi.string().allow(""),
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
module.exports.createPostRole = (req, res, next) => { 
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .messages({
                "string.empty" : "Vui lòng nhập tên quyền !",
            }),
        description : Joi.string().allow(""),
        permissions : Joi.array(),
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

