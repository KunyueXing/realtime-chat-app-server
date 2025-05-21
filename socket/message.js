const User = require('../models/user')
const OneToOneMessage = require('../models/oneToOneMessage')
const path = require('path')

modeule.exports = async (socket, io) => {
  // handle incoming text/link messages
  socket.on('text_message', async (data) => {
    console.log('Received text/link message:', data)

    const { sender, receiver, type, content, conversation_id } = data

    const senderUser = await User.findById(sender)
    const receiverUser = await User.findById(receiver)

    const new_message = {
      sender: senderUser._id,
      receiver: receiverUser._id,
      type,
      content
    }

    // fetch the chat between the sender and receiver
    const chats = await OneToOneMessage.findById(conversation_id)
    if (chats) {
      // if the chat exists, push the new message to the messages array and save the chat
      chats.messages.push(new_message)
      await chats.save({ new: true, validateModifiedOnly: true })
    } else {
      // if the chat does not exist, create a new chat with the new message
      const newChat = new OneToOneMessage({
        participants: [senderUser._id, receiverUser._id],
        messages: [new_message]
      })
      await newChat.save()
    }

    try {
      // emit incoming message to the receiver
      io.to(receiverUser?.socketId).emit('new_message', {
        message: new_message,
        conversation_id: conversation_id
      })

      // emit outgoing message to the sender
      io.to(senderUser?.socketId).emit('new_message', {
        message: new_message,
        conversation_id: conversation_id
      })
    } catch (error) {
      console.error('Error emiting messages to sender / receiver', error)
    }
  })

  socket.on('media_message', async (data) => {
    console.log('Received media / file message:', data)

    //data = { sender, receiver, type, file, conversation_id }

    // TODO:
    // get the file name and extension
    // upload the file to AWS S3 bucket
    // get the file URL from AWS S3 bucket
    // create a new message object with the file URL
    // push the new message to the messages array and save the chat
    // emit incoming message to the receiver
    // emit outgoing message to the sender
  })

  // get the chat history between the current user (sender) and all other receivers
  socket.on('get_direct_messages', async ({ user_id }, callback) => {
    // existing_chat contains the list of conversations between the current user and other users
    const existing_chat = await OneToOneMessage.find({
      participants: { $all: [user_id] }
    }).populate('participants', 'fistName lastName avatar _id email status')

    console.log('Existing chat:', existing_chat)

    if (existing_chat) {
      callback({
        status: 'success',
        data: existing_chat
      })
    } else {
      callback({
        status: 'failure',
        message: 'No chat found'
      })
    }
  })

  // Start a new conversation between two users
  socket.on('start_conversation', async (data) => {
    console.log('Start conversation:', data)

    const { sender, receiver } = data

    // check if the conversation already exists
    const existingChat = await OneToOneMessage.find({
      participants: { $size: 2, $all: [sender, receiver] }
    }).populate('participants', 'fistName lastName avatar _id email status')

    if (existingChat) {
      console.log('Conversation already exists:', existingChat)
      socket.emit('start_chat', existingChat[0])
    } else {
      // if the conversation does not exist, create a new conversation
      // emit the new conversation to the sender and receiver
      console.log('No conversation found, creating new conversation')
      let newChat = new OneToOneMessage.create({
        participants: [sender, receiver]
      })
      newChat = await OneToOneMessage.findById(newChat).populate('participants', 'fistName lastName avatar _id email status')

      socket.emit('start_chat', newChat)
    }
  })
}
