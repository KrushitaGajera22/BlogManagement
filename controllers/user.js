const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config");
const adminController = require("../controllers/admin");
const cookie = require("cookie");

const sendResetPasswordMail = async (name, email, token) => {
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
      from: config.email,
      to: email,
      subject: "Reset Password",
      html:
        "<p>Hiii " +
        name +
        ', Please click here to <a href="http:127.0.0.1/3000/reset-password?token=' +
        token +
        '">Reset</a> your password.',
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

const register = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};

const registerUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const saltRounds = 10;
    hash = await bcrypt.hash(password, saltRounds);
    const user = new User({
      name,
      email,
      password: hash,
    });
    const userData = await user.save();

    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.userId = userData._id;
        req.session.isAdmin = userData.isAdmin;
        // for converting objectId in string format
        userData._id = userData._id.toString("base64");
        //set cookie for finding user id in like and dislike
        const userCookie = cookie.serialize("user", JSON.stringify(userData), {
          maxAge: 30 * 24 * 60 * 60, // Expiration time in seconds (30 days)
          path: "/",
        });

        res.setHeader("Set-Cookie", [userCookie]);
        if (userData.isAdmin == true) {
          res.redirect("/dashboard");
        } else {
          res.redirect("/");
        }
      } else {
        res.render("login", { message: "Email and Password are incorrect!!" });
      }
    } else {
      res.render("login", { message: "Email and Password are incorrect!!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const profile = async (req, res) => {
  try {
    res.send("Profile");
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    // Remove a cookie by setting its value to an empty string and an expiration date in the past
    const deletedCookie = cookie.serialize("user", "", {
      expires: new Date(0),
      path: "/",
    });

    // Set the 'user' cookie to delete it
    res.setHeader("Set-Cookie", deletedCookie);
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const userlogout = async (req, res) => {
  try {
    // Remove a cookie by setting its value to an empty string and an expiration date in the past
    const deletedCookie = cookie.serialize("user", "", {
      expires: new Date(0),
      path: "/",
    });

    // Set the 'user' cookie to delete it
    res.setHeader("Set-Cookie", deletedCookie);
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPassword = async (req, res) => {
  try {
    res.render("forget-password");
  } catch (error) {
    console.log(error.message);
  }
};
const verifyForgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email });

    if (userData) {
      const randomString = randomstring.generate();

      await User.updateOne({ email: email }, { $set: { token: randomString } });
      sendResetPasswordMail(userData.name, userData.email, randomString);
      res.render("forget-password", {
        message: "Please check your mail to reset your password",
      });
    } else {
      res.render("forget-password", { message: "User email does not exist!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token });
    if (tokenData) {
      res.render("reset-password", { user_id: tokenData._id });
    } else {
      res.render("404");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyResetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const securePassword = await adminController.securePassword(password);
    await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: securePassword, token: "" } }
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  login,
  loginUser,
  profile,
  logout,
  userlogout,
  forgetPassword,
  verifyForgetPassword,
  resetPassword,
  register,
  registerUser,
  verifyResetPassword,
};
