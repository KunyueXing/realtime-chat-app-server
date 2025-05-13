const mongoose = require('mongoose')

const oneToOneMessageSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['text', 'media', 'document', 'link'],
        default: 'text'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      content: {
        type: String
      },
      file: {
        type: String
      },
      isRead: {
        type: Boolean,
        default: false
      },
      isDeleted: {
        type: Boolean,
        default: false
      }
    }
  ]
})

const OneToOneMessage = new mongoose.model('OneToOneMessage', oneToOneMessageSchema)

module.exports = OneToOneMessage
