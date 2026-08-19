const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating a user"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
      unique: true
    },

    name: {
      type: String,
      required: [true, "Name is required for creating a user"],
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required for creating a user"],
      minlength: [6, "Password should contain minimum 6 characters"],
      select: false
    }
  },
  {
    timestamps: true
  }
);


userSchema.pre("save",async function(next){

  if(!this.isModified("password")){//checks if password was changed
  return next()//skip the password-hashing code and continue saving

  const hash=await bcrypt.hash(this.password ,10)
this.password=hash//again stored it in passwoed
return next()

}
})

userSchema.method.comparePassword=async function(password){
  return await bcrypt.compare(password,this.password)//This code is used to check whether the password entered during login matches the hashed password stored in the database.
}
const userModel=mongoose.model("user",userSchema)
module.exports=userModel




//module.exports = mongoose.model("User", userSchema);