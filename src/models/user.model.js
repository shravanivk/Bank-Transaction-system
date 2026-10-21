
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        // User email
        email: {
            type: String,
            required: [true, "Email is required for creating a user"],
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
            unique: true
        },

        // User name
        name: {
            type: String,
            required: [true, "Name is required for creating a user"],
            trim: true
        },

        // User password
        password: {
            type: String,
            required: [true, "Password is required for creating a user"],
            minlength: [6, "Password should contain minimum 6 characters"],
            select: false
        },
   
         systemUser:{
            type:Boolean,
            default:false,
            immutable:true,
            select:false  
}   
    },
    
    {
        timestamps: true
    }
);


// Hash password before saving the user
userSchema.pre("save", async function () {

    // If password has not been changed,
    // don't hash it again
    if (!this.isModified("password")) {
        return;
    }

    // Hash the password using bcrypt
    const hash = await bcrypt.hash(this.password, 10);

    // Store the hashed password
    this.password = hash;
});


// Compare entered password with the hashed password
userSchema.methods.comparePassword = async function (password) {

    return await bcrypt.compare(password, this.password);

};


// Create the User model
const userModel = mongoose.model("user", userSchema);


// Export the User model
module.exports = userModel;

