const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlacklistModel=require("../models/blackList.model")



// user register controller
// POST /api/auth/register

async function userRegisterController(req, res) {

    const { email, password, name } = req.body;

    // to check if email already exists
    const isExists = await userModel.findOne({
        email: email
    });

    if (isExists) {
        return res.status(422).json({
            message: "user already exists with this email.",
            status: "Failed"
        });
    }

    const user = await userModel.create({
        email,
        password,
        name
    });

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token);

    // Send registration email
    await emailService.sendRegistrationEmail(
        user.email,
        user.name
    );

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}


// user login controller

async function userLoginController(req, res) {

    const { email, password } = req.body;

    console.log("Email received:", email);
    console.log("Password received:", password);

    const user = await userModel
        .findOne({ email })
        .select("+password");

    console.log("User found:", user);

    if (!user) {
        return res.status(401).json({
            message: "email or password is invalid"
        });
    }

    console.log("Stored hashed password:", user.password);

    const isValidPassword = await user.comparePassword(password);

    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
        return res.status(401).json({
            message: "email or password is invalid"
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token);

    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}


async function userLogoutController(req, res) {

    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        });
    }
res.cookies("token","")
await tokenBlacklistModel.create({
    token:token
})

res.status(200).json({
     message: "User logged out successfully"
})
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
};