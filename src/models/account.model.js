const mongoose = require("mongoose");

const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"Accouunt must be associated with user"],
        index:true
    },
    status:{
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"status can be either ACTIVE,FROZEN or CLOSED"
        }
    },
    currency:{
        type:string,
        required:[true,"Currency is required for creating account"],
        default:"INR"
    },
   

},{
    timestamps:true
})
accountSchema.index({user:1,status:1})//compound index
const accountModel=mongoose.model("account",accountSchema)
module.exports=accountModel