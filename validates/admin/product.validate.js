const Joi = require('joi');

module.exports.createProduct = (req, res, next) => {
  const schema = Joi.object({
    // Thông tin cơ bản
    name: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập tên sản phẩm!"
    }),
    category: Joi.string().required().messages({
      "string.empty": "Vui lòng chọn danh mục!"
    }),
    status: Joi.string().required().messages({
      "string.empty": "Vui lòng chọn trạng thái!"
    }),

    // Hình ảnh
    avatar: Joi.any(),
    images: Joi.any(),

    // Giá & tồn kho
    price: Joi.number().min(0).required().messages({
      "number.base": "Giá gốc phải là số!",
      "number.min": "Giá gốc không được âm!",
      "any.required": "Vui lòng nhập giá gốc!"
    }),
    salePrice: Joi.number().min(0).allow(null, ""),
    unit: Joi.string().required().messages({
      "string.empty": "Vui lòng chọn đơn vị tính!"
    }),
    stock: Joi.number().min(0).required().messages({
      "number.base": "Số lượng tồn kho phải là số!",
      "number.min": "Số lượng tồn kho không được âm!",
      "any.required": "Vui lòng nhập số lượng tồn kho!"
    }),

    // Mô tả
    shortDescription: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập mô tả ngắn!"
    }),
    description: Joi.string().allow(""),

    // Các thông tin đặc thù (cho phép bỏ trống)
    activeIngredient: Joi.string().allow(""),
    dosageForm: Joi.string().allow(""),
    packaging: Joi.string().allow(""),
    manufacturer: Joi.string().allow(""),
    countryOfOrigin: Joi.string().allow(""),
    registrationNumber: Joi.string().allow(""),
    indication: Joi.string().allow(""),
    contraindication: Joi.string().allow(""),
    dosage: Joi.string().allow(""),
    sideEffects: Joi.string().allow(""),
    storage: Joi.string().allow(""),
    ageGroup: Joi.string().allow(""),
    safetyComponents: Joi.string().allow(""),
    nutrientContent: Joi.string().allow(""),
    targetAudience: Joi.string().allow(""),
    recommendedDosage: Joi.string().allow(""),
    ingredientsSupplement: Joi.string().allow(""),
    expirationDate: Joi.string().allow(""),
    certificationSupplement: Joi.string().allow(""),
    skinType: Joi.string().allow(""),
    mainIngredientsPersonalCare: Joi.string().allow(""),
    usageInstructionsPersonalCare: Joi.string().allow(""),
    volume: Joi.string().allow(""),
    distributorPersonalCare: Joi.string().allow(""),
    productTypeBeauty: Joi.string().allow(""),
    colorScent: Joi.string().allow(""),
    activeIngredientsBeauty: Joi.string().allow(""),
    usageTime: Joi.string().allow(""),
    distributorBeauty: Joi.string().allow(""),
    deviceType: Joi.string().allow(""),
    usageInstructionsDevice: Joi.string().allow(""),
    powerSource: Joi.string().allow(""),
    medicalCertification: Joi.string().allow(""),
    warranty: Joi.string().allow(""),
    productTypeConvenience: Joi.string().allow(""),
    usageConvenience: Joi.string().allow(""),
    manufacturerConvenience: Joi.string().allow("")
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      code: "error",
      messages: error.details.map(err => err.message)
    });
  }

  next();
};
