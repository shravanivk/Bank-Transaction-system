const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");


// ===============================
// USER REGISTER CONTROLLER
// POST /api/auth/register
// ===============================

async function userRegisterController(req, res) {

    try {

        const { email, password, name } = req.body;


        // Check if email already exists
        const isExists = await userModel.findOne({
            email: email
        });

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with this email.",
                status: "Failed"
            });
        }


        // Create new user
        const user = await userModel.create({
            email,
            password,
            name
        });


        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        );


        // Store token in cookie
        res.cookie("token", token);


        // Send registration email
        await emailService.sendRegistrationEmail(
            user.email,
            user.name
        );


        // Send response
        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {

        console.error("Register error:", error);

        return res.status(500).json({
            message: "Something went wrong while registering",
            error: error.message
        });
    }
}



// ===============================
// USER LOGIN CONTROLLER
// POST /api/auth/login
// ===============================

async function userLoginController(req, res) {

    try {

        const { email, password } = req.body;

        console.log("Email received:", email);
        console.log("Password received:", password);


        // Find user
        const user = await userModel
            .findOne({ email })
            .select("+password");


        console.log("User found:", user);


        // User doesn't exist
        if (!user) {
            return res.status(401).json({
                message: "email or password is invalid"
            });
        }


        console.log("Stored hashed password:", user.password);


        // Compare password
        const isValidPassword = await user.comparePassword(password);


        console.log("Password valid:", isValidPassword);


        // Wrong password
        if (!isValidPassword) {
            return res.status(401).json({
                message: "email or password is invalid"
            });
        }


        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        );


        // Store token in cookie
        res.cookie("token", token);


        // Send response
        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong while logging in",
            error: error.message
        });
    }
}



module.exports = {
    userRegisterController,
    userLoginController
};