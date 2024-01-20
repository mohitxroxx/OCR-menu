const express=require('express')
const dotenv=require('dotenv')
const cors=require('cors')
const socket=require('socket.io')
const msg = require("./routes/msg");
const connectDB = require('./config/db')
const auth = require("./routes/admin")
dotenv.config({path:'./config/.env'})
connectDB()

const app=express()
app.use(cors());
app.use(express.json());


app.use("/api/messages", msg)
app.use("/api", auth)

const PORT = app.listen(process.env.PORT, () =>
  console.log(`SERVER UP and running at ${process.env.PORT}`)
)

const io = socket(PORT, {
  cors: {
    origin: "*",
    credentials: true,
  },
})

global.onlineUsers = new Map()
io.on("connection", (socket) => {
  global.chatSocket = socket
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id)
  })

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to)
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg)
    }
  })
})

