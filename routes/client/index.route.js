const router = require('express').Router();

const homeRoutes = require("./home.route");
const accountRoutes = require("./account.route");
const profileRoutes = require("./profile.route");


const authMiddleware = require("../../middlewares/client/auth.middlewares")
router.use((req,res,next) => {
  res.setHeader('Cache-Control','no-store')
  next();
})
// Trang tài khoản
router.use('/account', accountRoutes);

// Trang chủ
router.use('/',authMiddleware.verifyToken, homeRoutes);
router.use('/profile',authMiddleware.verifyToken, profileRoutes);



module.exports = router;
