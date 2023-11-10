const mongoose = require("mongoose");

const settingSchema = mongoose.Schema({
  postLimit: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Settings", settingSchema);