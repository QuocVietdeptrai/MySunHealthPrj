const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema(
  {
    name: String,
    category: String,
    position: Number,
    status: String,
    avatar: String, // Ảnh đại diện
    images: Array,  // Danh sách ảnh

    // Giá & tồn kho
    price: Number,
    salePrice: Number,
    unit: String,
    stock: Number,

    // Mô tả
    shortDescription: String,
    description: String,

    // Các trường đặc thù (extra fields)
    activeIngredient: String,
    dosageForm: String,
    packaging: String,
    manufacturer: String,
    countryOfOrigin: String,
    registrationNumber: String,
    indication: String,
    contraindication: String,
    dosage: String,
    sideEffects: String,
    storage: String,
    ageGroup: String,
    safetyComponents: String,
    nutrientContent: String,
    targetAudience: String,
    recommendedDosage: String,
    ingredientsSupplement: String,
    expirationDate: String,
    certificationSupplement: String,
    skinType: String,
    mainIngredientsPersonalCare: String,
    usageInstructionsPersonalCare: String,
    volume: String,
    distributorPersonalCare: String,
    productTypeBeauty: String,
    colorScent: String,
    activeIngredientsBeauty: String,
    usageTime: String,
    distributorBeauty: String,
    deviceType: String,
    usageInstructionsDevice: String,
    powerSource: String,
    medicalCertification: String,
    warranty: String,
    productTypeConvenience: String,
    usageConvenience: String,
    manufacturerConvenience: String,

    // Quản lý
    createdBy: String,
    updatedBy: String,

    slug: {
      type: String,
      slug: "name",
      unique: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
    deletedBy: String,
    deletedAt: Date
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', schema, "products");

module.exports = Product;
