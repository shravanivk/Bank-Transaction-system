const express=require(express)

const router=express.Router()
const authRouter=require("./routes/auth.routes")

app.use("/api/auth",authRouter)//strating with api and auth will redirect to authRouter
module.exports=app