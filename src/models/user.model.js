const mongoose=require("mongoose")

const userSchema=mongoose.schema({
    email:{
        type:string,
        required:[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/]
    }
})