const express=require("express")
const cookieparser=require("cookie-parser")
const router=express.Router()
const authRouter=require("./routes/auth.routes")
app.use(express.json())
app.use("/api/auth",authRouter)//strating with api and auth will redirect to authRouter
app.use(cookieparser())

module.exports=app