const mongoose = require("mongoose");

const blogSettingSchema = mongoose.Schema({
  blogTitle: {
    type: String,
    required: true,
  },
  blogLogo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("BlogSetting", blogSettingSchema);
