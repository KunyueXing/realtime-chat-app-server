const mongoose = require('mongoose')

const oneToOneMessageSchema = new mongoose.Schema({
  // there're two participants in a one-to-one chat, the sender and the receiver
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  isPinned: {
    type: Boolean,
    default: false
  },
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
        // Passes the function reference to Mongoose, which calls Date.now() each time a 
        // message is created, as intended. Don't call Date.now() directly here, as it would
        // set the same timestamp for all messages created at the same time.
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
      }
      // isDeleted: {
      //   type: Boolean,
      //   default: false
      // }
    }
  ]
})

const OneToOneMessage = new mongoose.model('OneToOneMessage', oneToOneMessageSchema)

module.exports = OneToOneMessage
