var jwt = require('jsonwebtoken');
const AccountUser = require("../../models/account-user.model");

module.exports.verifyToken = async (req , res , next ) => {
    try {
        const token = req.cookies.token;

        if(!token){
            res.redirect(`/account/login`);
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id , email } = decoded
        const existAccount = await AccountUser.findOne({
            _id:id,
            email:email,
            status:"active"
        })

        if(!existAccount){
            res.clearCookie("token");
            res.redirect(`/account/login`);
            return;
        }

        req.account = existAccount;
        res.locals.account = existAccount;

        next();
    } catch (error) {
        res.clearCookie("token");
        res.redirect(`/account/login`);
    }
}