const Post = require("../models/post");
const Setting = require("../models/setting");
const Like = require("../models/like");
const ObjectId = require("mongodb").ObjectId;
const config = require("../config/config");
const nodemailer = require("nodemailer");

const sendMail = async (name, email, post_id) => {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.email,
        pass: config.password,
      },
    });
    const mailOptions = {
      from: "Blog Management",
      to: email,
      subject: "New Reply!!",
      html:
        "<p>" +
        name +
        ', has replied on your comment <a href="http://localhost:3000/post/' +
        post_id +
        '">Read replies here</a> </p>',
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent: ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const blog = async (req, res) => {
  try {
    var setting = await Setting.findOne({});
    var limit = setting.postLimit;

    const posts = await Post.find({}).limit(limit);
    res.render("blog", { posts, limit });
  } catch (error) {
    console.log(error.message);
  }
};

const getPost = async (req, res) => {
  try {
    const likes = await Like.countDocuments({ post: req.params.id, type: 1 });
    const dislikes = await Like.countDocuments({
      post: req.params.id,
      type: 0,
    });
    const post = await Post.findOne({ _id: req.params.id });
    res.render("post", { post, likes, dislikes });
  } catch (error) {
    console.log(error.message);
  }
};

const addComment = async (req, res) => {
  try {
    var post_id = req.body.post_id;
    var username = req.body.username;
    var email = req.body.email;
    var comment = req.body.comment;
    const comment_id = new ObjectId();

    await Post.findByIdAndUpdate(
      { _id: post_id },
      {
        $push: {
          comments: { _id: comment_id, username, email, comment },
        },
      }
    );
    res
      .status(200)
      .send({ success: true, msg: "Comment Added!!", _id: comment_id });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const doReply = async (req, res) => {
  try {
    var reply = new ObjectId();
    await Post.updateOne(
      {
        _id: new ObjectId(req.body.post_id),
        "comments._id": new ObjectId(req.body.comment_id),
      },
      {
        $push: {
          "comments.$.replies": {
            _id: reply,
            name: req.body.name,
            reply: req.body.reply,
          },
        },
      }
    );
    sendMail(req.body.name, req.body.comment_email, req.body.post_id);
    res.status(200).send({ success: true, msg: "Reply Added!!", _id: reply });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .skip(req.params.start)
      .limit(req.params.limit);
    res.status(200).send({ posts });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const contact = async (req, res) => {
  try {
    res.render("contact");
  } catch (error) {
    console.log(error.message);
  }
};

const contactdetails = async (req, res) => {
  try {
    try {
      const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: config.email,
          pass: config.password,
        },
      });
      const mailOptions = {
        from: req.body.email,
        to: config.email,
        subject: `Message from ${req.body.name} : ${req.body.subject}`,
        html: req.body.message,
      };

      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(400).send({ success: false, msg: error.message });
        } else {
          console.log("Email has been sent: ", info.response);
          res
            .status(200)
            .send({ success: true, msg: "Email has been sent successfully!" });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const about = async (req, res) => {
  try {
    res.render("about");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  blog,
  getPost,
  addComment,
  doReply,
  getPosts,
  contact,
  contactdetails,
  about,
};
