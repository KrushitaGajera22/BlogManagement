const BlogSetting = require("../models/blogSettingModel");
const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcrypt");
const Setting = require("../models/setting");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const blogSetup = async (req, res) => {
  try {
    var blogSetting = await BlogSetting.find({});

    if (blogSetting.length > 0) {
      res.redirect("/login");
    } else {
      res.render("blogSetup");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const blogSetupSave = async (req, res) => {
  try {
    const blogTitle = req.body.blogTitle;
    const blogImage = req.file.filename;
    const description = req.body.description;
    const email = req.body.email;
    const name = req.body.name;
    const password = await securePassword(req.body.password);

    const blogSetting = new BlogSetting({
      blogTitle: blogTitle,
      blogLogo: blogImage,
      description: description,
    });

    await blogSetting.save();

    const user = new User({
      name: name,
      email: email,
      password: password,
      isAdmin: true,
    });
    const userData = await user.save();
    if (userData) {
      res.redirect("/login");
    } else {
      res.render("blogSetup", { message: "Blog does not setup properly!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const dashboard = async (req, res) => {
  try {
    const posts = await Post.find({});
    res.render("admin/dashboard", { posts });
  } catch (error) {
    console.log(error.message);
  }
};

const postDashboard = async (req, res) => {
  try {
    res.render("admin/postDashboard");
  } catch (error) {
    console.log(error.message);
  }
  1;
};

const addPost = async (req, res) => {
  try {
    var image = "";
    if (req.body.image !== undefined) {
      image = req.body.image;
    }
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      image,
    });
    const postData = await post.save();
    res.send({
      success: true,
      msg: "Post added successfully!",
      _id: postData.id,
    });

    // res.render("admin/postDashboard", { message: "Post added successfully!" });
  } catch (error) {
    res.send({ success: false, msg: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.body.id });
    res.status(200).send({ success: true, msg: "Post deleted successfully!" });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const editPost = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          image: req.body.image,
        },
      }
    );
    res.status(200).send({ success: true, msg: "Post updated successfully!" });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const viewedit = async (req, res) => {
  try {
    var post = await Post.findOne({ _id: req.params.id });
    res.render("admin/editPost", { post });
  } catch (error) {
    console.log(error.message);
  }
};

const uploadImage = async (req, res) => {
  try {
    var imagePath = "/images";
    imagePath = imagePath + "/" + req.file.filename;
    res.send({
      success: true,
      msg: "Image uploaded successfully!",
      path: imagePath,
    });
  } catch (error) {
    res.send({ success: false, msg: error.message });
  }
};

const viewSettings = async (req, res) => {
  try {
    var setting = await Setting.findOne({});
    var postLimit = 0;
    if (setting !== null) {
      postLimit = setting.postLimit;
    }
    res.render("admin/viewSettings", { postLimit });
  } catch (error) {
    console.log(error.message);
  }
};

const Settings = async (req, res) => {
  try {
    await Setting.updateOne(
      {},
      {
        postLimit: req.body.limit,
      },
      { upsert: true }
    );
    res.status(200).send({ success: true, msg: "Settings updated!!" });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    var post = await Post.findOne({ _id: req.params.id });
    res.render("admin/viewPost", { post });
  } catch (error) {
    console.log(error.message);
  }
  1;
};


module.exports = {
  blogSetup,
  blogSetupSave,
  dashboard,
  postDashboard,
  addPost,
  securePassword,
  uploadImage,
  deletePost,
  editPost,
  viewedit,
  viewSettings,
  Settings,
  getPost,
};
