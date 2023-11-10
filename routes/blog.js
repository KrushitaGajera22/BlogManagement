const express = require("express");
const blog = express();

blog.set("view engine", "ejs");
blog.set("views", "./views");

blog.use(express.static("public"));

const blogController = require("../controllers/blog");
const adminAuth = require('../middlewares/adminAuth')

blog.get('/', blogController.blog)
blog.get('/post/:id', blogController.getPost)

blog.get('/contact', blogController.contact)
blog.post('/contact', blogController.contactdetails)

blog.get('/about', blogController.about)

blog.post('/add-comment', blogController.addComment)
blog.post('/do-reply', blogController.doReply)

blog.get('/getPosts/:start/:limit', blogController.getPosts)

module.exports = blog;
