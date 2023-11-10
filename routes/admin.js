const express = require("express");
const admin = express();
const path = require("path");

const bodyParser = require("body-parser");
admin.use(bodyParser.json());
admin.use(bodyParser.urlencoded({ extended: true }));

const session = require("express-session");
const config = require("../config/config");
admin.use(
  session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
  })
);

admin.set("view engine", "ejs");
admin.set("views", "./views");

const multer = require("multer");

admin.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

const adminController = require("../controllers/admin");
const adminAuth = require("../middlewares/adminAuth");

admin.get("/blog-setup", adminController.blogSetup);
admin.post(
  "/blog-setup",
  upload.single("blogImage"),
  adminController.blogSetupSave
);
admin.get("/dashboard", adminAuth.isLogin, adminController.dashboard);

admin.get("/create-post", adminAuth.isLogin, adminController.postDashboard);
admin.post("/create-post", adminAuth.isLogin, adminController.addPost);
admin.post("/delete-post", adminAuth.isLogin, adminController.deletePost);
admin.post("/edit-post", adminAuth.isLogin, adminController.editPost);
admin.get("/edit-post/:id", adminAuth.isLogin, adminController.viewedit);
admin.post("/delete-post", adminAuth.isLogin, adminController.deletePost);
admin.get("/view-post/:id", adminAuth.isLogin, adminController.getPost);

admin.get("/settings", adminAuth.isLogin, adminController.viewSettings);
admin.post("/settings", adminAuth.isLogin, adminController.Settings);

admin.post(
  "/upload-image",
  upload.single("image"),
  adminAuth.isLogin,
  adminController.uploadImage
);

module.exports = admin;
