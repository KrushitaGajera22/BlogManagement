const mongoose = require("mongoose");

const likeSchema = mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Like", likeSchema);
