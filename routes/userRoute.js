const express=require("express");
const { registerUser,verification,loginUser, getLoginPage, logout,forgotPassword, resetPassword, getUserDetails, updatePassword, updateprofile, getAllUser, getSingleuser, updateUserRole, deleteUser, getRegisterPage } = require("../controllers/userController.js");
const { isAuthenticatedUser ,authorizeRoles } = require("../middleware/auth");
const router=express.Router();

router.route('/register').get(getRegisterPage);
router.route('/login').get(getLoginPage);
router.route("/register").post(registerUser)
router.route("/verify/:token").get(verification);
router.route("/login").post(loginUser)
router.route("/logout").get(logout);
// router.route("/password/forgot").post(forgotPassword);
// router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").get(isAuthenticatedUser, updatePassword);
router.route("/me/update").get(isAuthenticatedUser,updateprofile);
router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUser);


router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleuser)
.put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser);

module.exports = router;