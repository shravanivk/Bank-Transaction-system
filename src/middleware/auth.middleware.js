const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")
const tokenBlacklistModel=require("../models/blackList.model")


//token cookies main aaraha hai ki nahi
async function authMiddleware(req,res,next){
    //Get the JWT token from the cookie. If it isn't there, get it from the Authorization header
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"unauthorized access ,token is missing"
        })
    }


    const isBlackListed=await tokenBlacklistModel.findOne({token})

    if(isBlackListed){
        return res.status(401).json({
            message:"unauthorized access,token invalid"
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
async function authSytemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        });
    }

    const isBlackListed=await tokenBlacklistModel.findOne({token})

    if(isBlackListed){
        return res.status(401).json({
            message:"unauthorized access,token invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403)({
                message:"forbidden access not a system user"
            })
        }

        req.user=user
        return next()
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
}
module.exports={
    authMiddleware,
    authSytemUserMiddleware
}