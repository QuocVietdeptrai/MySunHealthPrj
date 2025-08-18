const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema(
  {
    name: String, // Tên sản phẩm
    category: String, // Danh mục
    position: Number, // Vị trí
    status: String, // Trạng thái
    avatar: String, // Ảnh đại diện
    images: Array,  // Danh sách ảnh

    // Giá & tồn kho
    price: Number, // Giá gốc
    salePrice: Number, // Giá khuyến mãi
    unit: String, // Đơn vị tính
    stock: Number, // Số lượng tồn kho

    // Mô tả
    shortDescription: String, // Mô tả ngắn
    description: String, // Mô tả chi tiết

    // Các trường đặc thù (extra fields)
    activeIngredient: String, // Hoạt chất
    dosageForm: String, // Dạng bào chế
    packaging: String, // Quy cách đóng gói
    manufacturer: String, // Nhà sản xuất
    countryOfOrigin: String, // Nước sản xuất
    registrationNumber: String, // Số đăng ký
    indication: String, // Chỉ định
    contraindication: String, // Chống chỉ định
    dosage: String, // Liều dùng
    sideEffects: String, // Tác dụng phụ
    storage: String, // Bảo quản
    ageGroup: String, // Độ tuổi phù hợp
    safetyComponents: String, // Thành phần an toàn
    nutrientContent: String, // Hàm lượng dinh dưỡng
    targetAudience: String, // Đối tượng sử dụng
    recommendedDosage: String, // Liều dùng khuyến nghị
    ingredientsSupplement: String, // Thành phần chi tiết
    expirationDate: String, // Hạn sử dụng
    certificationSupplement: String, // Chứng nhận
    skinType: String, // Kiểu da/Thể loại
    mainIngredientsPersonalCare: String, // Thành phần chính
    usageInstructionsPersonalCare: String, // Hướng dẫn sử dụng
    volume: String, // Khối lượng/Dung tích
    distributorPersonalCare: String, // Nhà phân phối
    productTypeBeauty: String, // Loại sản phẩm
    colorScent: String, // Màu sắc/Hương thơm
    activeIngredientsBeauty: String, // Thành phần hoạt tính
    usageTime: String, // Thời gian sử dụng
    distributorBeauty: String, // Nhà phân phối
    deviceType: String, // Loại thiết bị
    usageInstructionsDevice: String, // Hướng dẫn sử dụng
    powerSource: String, // Nguồn điện
    medicalCertification: String, // Chứng nhận y tế
    warranty: String, // Bảo hành
    productTypeConvenience: String, // Loại sản phẩm
    usageConvenience: String, // Công dụng
    manufacturerConvenience: String, // Nhà sản xuất

    // Quản lý
    createdBy: String, // Người tạo
    updatedBy: String, // Người cập nhật

    slug: { // Đường dẫn tĩnh
      type: String,
      slug: "name",
      unique: true
    },
    deleted: { // Đã xóa
      type: Boolean,
      default: false
    },
    deletedBy: String, // Người xóa
    deletedAt: Date // Thời gian xóa
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Product = mongoose.model('Product', schema, "products");

module.exports = Product; 