const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")


//token cookies main aaraha hai ki nahi
async function authMiddleware(req,res,next){
    //Get the JWT token from the cookie. If it isn't there, get it from the Authorization header
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"unauthorized access ,token is missing"
        })
    }
    try{


       const decoded=jwt.verify(token,process.env.JWT_SECRET)//decoded ke andar user ki id aayegi
       const user=await userModel.findById(decoded.userId)//verifyinng the tokn

       req.user=user
       return next()//stop this middleware and move to the next middleware/route.”


    }catch(err){
        return res.status(401).json({
            message:"unauthorized access ,token is missing"
        })
    }
}

module.exports={
    authMiddleware
}