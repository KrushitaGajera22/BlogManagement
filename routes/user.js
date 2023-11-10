const express = require("express");
const user = express();

const bodyParser = require("body-parser");
user.use(bodyParser.json());
user.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
user.use(cookieParser());

const session = require("express-session");
const config = require("../config/config");
user.use(
  session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
  })
);

user.set("view engine", "ejs");
user.set("views", "./views");

user.use(express.static("public"));

const userController = require("../controllers/user");
const adminAuth = require('../middlewares/adminAuth')

user.get("/login", adminAuth.isLogout, userController.login);
user.get("/register", adminAuth.isLogout, userController.register);
user.post("/login", userController.loginUser);
user.post("/register", userController.registerUser);
user.get("/logout", adminAuth.isLogin, userController.logout);
user.get("/user-logout", adminAuth.isUserLogin, userController.userlogout);
user.get("/profile", userController.profile);

user.get("/forget-password", adminAuth.isLogout, userController.forgetPassword);
user.post("/forget-password", userController.verifyForgetPassword);


user.get("/reset-password", adminAuth.isLogout, userController.resetPassword);
user.post("/reset-password", userController.verifyResetPassword);

module.exports = user;
