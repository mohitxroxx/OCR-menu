const Messages = require("../models/user")
const axios=require('axios')

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 })

    const curr_msg = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      }
    })
    res.json(curr_msg)
  } catch (ex) {
    next(ex)
  }
}

module.exports.addMessage = async (req, res, next) => {
  try {
    const authtoken=await axios.get('http://localhost:6000')
    console.log(authtoken.data)
    const { from, to, message } = req.body
    const data = await Messages.create({
      message: { text: authtoken.data },
      users: [from, to],
      sender: from,
    })

    if (data)
    return res.json({ msg: "Message sent" })
    else return res.json({ msg: "Failed to send the msg" })
  } catch (ex) {
    next(ex)
  }
}

