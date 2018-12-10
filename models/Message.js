const mongoose = require("mongoose");

const MessageModel = mongoose.model("Message", {
  text: String,
  createdAt: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread"
  },
  isRequest: {
    type: Boolean,
    default: false
  }
});

module.exports = MessageModel;
