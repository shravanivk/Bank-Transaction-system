const express=require("express")
const authMiddleware=require("../middleware/auth.middleware")
const accountController=require("../controllers/account.controller")



const router=express.Router()
//api creation
//to create a new account

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

router.get("/",authMiddleware.authMiddleware,accountController.createAccountController)

router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController)
module.exports= router