const dotenv = require('dotenv')
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")
const User = require("../models/user")
const express = require("express")
const cookieParser = require('cookie-parser')
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer')
let permanent

const app = express()

app.use(express.json())
app.use(cookieParser())
dotenv.config()



app.post("/login", async (req, res) => {
    try {
        const { username, password,rememberMe } = req.body
        const user = await User.findOne({ username })
        if (!user)
            return res.json({ msg: "Incorrect Username or Password", status: false })
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect Username or Password", status: false })
        delete user.password
        const expiresIn = rememberMe ? '7d' : '2h';
        const token = jwt.sign({ id: user.id, username: user.username },  process.env.TOKEN_KEY, { expiresIn })
        res.cookie('jwt', token, {
            secure: true,
            maxAge: expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.json({msg: 'Login successful',status: true})
        // return res.json({ msg: "Authentication approved, Welcome to the site", status: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Server error', status: false })
    }
})



app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body
        const usernameCheck = await User.findOne({ username })
        if (usernameCheck)
            return res.json({ msg: "Username already used", status: false })
        const emailCheck = await User.findOne({ email })
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false })
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
        })
        delete user.password
        return res.json({ msg: "Registered successfully", status: true })
    } catch (error) {
        console.error('Error registering user:', error)
        res.json({ status: false, msg: 'Internal server error' })
    }
})




app.get("/home", auth, (req, res) => {
    res.status(200).send("User Logged in and Session is Active")
})


app.get("/logout",async(req, res) => {
    try {
      res.clearCookie('jwt')
      return res.status(200).send("User Logged out and session ended")
    } catch (ex) {
      next(ex)
    }
  })



const { SMTP_EMAIL, SMTP_PASS } = process.env

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASS,
    },
})

app.post("/otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.ceil(Math.random() * 1000000);
    permanent = otp
    const mailOptions = {
        from: SMTP_EMAIL,
        to: email,
        subject: "Welcome To Health Bot",
        html: `<body>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">
        <table role="presentation" cellspacing="0" cellpadding="0"  width="600"
        style="margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);">
        <tr>
        <td>
        <h3 style="color: #0838bc; font-size: 24px; text-align: center; margin-bottom: 10px;">Verification Mail</h3>
        <hr style="border: 1px solid #ccc; margin: 20px 0;">
        <h4 style="font-size: 20px; color: #333;">Hi there,</h4>
        <p style="font-size: 16px; color: #333; margin: 20px 0;">Here is the otp to confirm your mail ${otp}</p>
        <p style="font-size: 16px; color: #333;">We are happy to have you.</p>
                    <div style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">
                    <h5 style="font-size: 18px;">Best Regards</h5>
                        <h5 style="font-size: 18px;">Health Bot</h5>
                    </div>
                </td>
            </tr>
            </table>
            </body>
            </body>`,
    }
    transporter
        .sendMail(mailOptions)
        .then(() => {
            res.json({ status: true, message: 'Mail Sent to the user' })
        })
        .catch((err) => {
            console.log(err);
        })
    })

app.post("/verify", async (req, res) => {
    const { otp } = req.body

    if (permanent == otp) {
        res.json({ status: true, message: 'OTP verified successfully' })
    } else {
        res.json({ status: false, message: 'Invalid OTP' })
    }
})


module.exports = app;