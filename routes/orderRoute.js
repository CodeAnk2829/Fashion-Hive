const express =require("express");
const router = express.Router();
const {newOrder, getSingleOrder, getMyOrders, getAllOrders, updateOrder, deleteOrder} =require("../controllers/orderController.js")
const {isAuthenticatedUser,authorizeRoles} =require("../middleware/auth");
router.route("/order/new").post(isAuthenticatedUser,newOrder);
router.route("/order/:id").get(isAuthenticatedUser,getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser,getMyOrders);

router.route("/admin/orders").get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders);
router.route("/admiin/order/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder).
delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder);

module.exports = router;