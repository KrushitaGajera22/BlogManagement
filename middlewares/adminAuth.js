const cookie = require("cookie");
const isLogin = async (req, res, next) => {
  try {
    if (req.session.userId && req.session.isAdmin == true) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.userId && req.session.isAdmin == true) {
      res.redirect("/dashboard");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isUserLogin = async (req, res, next) => {
  try {
    if (req.session.userId && req.session.isAdmin == false) {
      next();
    } else {
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { isLogin, isLogout, isUserLogin };
