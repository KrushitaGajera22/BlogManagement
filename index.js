const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/blogManagement");

var http = require("http").createServer(app);
var { Server } = require("socket.io");
var io = new Server(http, {});

const isBlog = require("./middlewares/isBlog");
app.use(isBlog.isBlog);

//for admin routes
const admin = require("./routes/admin");
app.use("/", admin);

//for user routes
const user = require("./routes/user");
app.use("/", user);

//for blog routes
const blog = require("./routes/blog");
app.use("/", blog);

const Post = require("./models/post");
const Like = require("./models/like");
const ObjectId = require("mongodb").ObjectId;

io.on("connection", function (socket) {
  console.log("connected!");
  socket.on("new_post", function (formData) {
    socket.broadcast.emit("new_post", formData);
  });
  socket.on("new_comment", function (comment) {
    io.emit("new_comment", comment);
  });
  socket.on("new_reply", function (reply) {
    io.emit("new_reply", reply);
  });
  socket.on("delete_post", function (post) {
    socket.broadcast.emit("delete_post", post);
  });
  socket.on("increment", async function (post) {
    var data = await Post.findOneAndUpdate(
      { _id: new ObjectId(post) },
      {
        $inc: { views: 1 },
      },
      { new: true }
    );
    socket.broadcast.emit("updated_views", data);
  });
  socket.on("like", async function (data) {
    await Like.updateOne(
      {
        post: data.post,
        user: data.user,
      },
      {
        type: 1,
      },
      { upsert: true }
    );

    const likes = await Like.countDocuments({ post: data.post, type: 1 });
    const dislikes = await Like.countDocuments({ post: data.post, type: 0 });

    io.emit("likeDislike", {
      post: data.post,
      likes,
      dislikes,
    });
  });
  socket.on("dislike", async function (data) {
    await Like.updateOne(
      {
        post: data.post,
        user: data.user,
      },
      {
        type: 0,
      },
      { upsert: true }
    );

    const likes = await Like.countDocuments({ post: data.post, type: 1 });
    const dislikes = await Like.countDocuments({ post: data.post, type: 0 });

    io.emit("likeDislike", {
      post: data.post,
      likes,
      dislikes,
    });
  });
});

http.listen(3000, () => {
  console.log("server is running");
});

// app.listen(3000, () => {
//   console.log("server is running");
// });
