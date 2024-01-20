const express=require('express')
const router=express.Router()
const login=require('../controllers/auth')
const home=require('../controllers/auth')
const register=require('../controllers/auth')
const otp=require('../controllers/auth')
const verify=require('../controllers/auth')
const logout=require('../controllers/auth')
const upload=require('../controllers/auth')

router.post('/login',login)
router.post('/register',register)
router.get('/home',home)
router.post('/otp',otp)
router.post('/verify',verify)
router.get('/logout',logout)
router.post('/upload',upload)

module.exports=router