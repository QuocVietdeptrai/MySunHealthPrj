const Order = require('../../models/order.model'); 

module.exports = async (req, res, next) => {
  try {
    const count = await Order.countDocuments({ status: 'initial' });
    res.locals.countInitialOrders = count;
  } catch (err) {
    console.error('Error counting initial orders:', err);
    res.locals.countInitialOrders = 0;
  }
  next();
};
