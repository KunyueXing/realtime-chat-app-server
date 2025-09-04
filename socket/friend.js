const User = require('../models/user')

module.exports = async (socket, io) => {
  socket.on('send_friend_request', async (data) => {
    console.log('Friend request received:', data)
    // Get the socketId of the receiver and sender
    const { friendRequest, receiver, sender } = data
    const receiverUser = await User.findById(receiver).select('socketId')
    const senderUser = await User.findById(sender).select('firstName lastName _id status avatar')

    // Use optional chaining (?.) to safely access socketID from receiver
    // It won't throw an error if receiver is null or undefined, it just return undefined.
    try {
      io.to(receiverUser?.socketId).emit('new_friend_request', {
        message: 'You have a new friend request',
        friendRequest,
        sender: senderUser
      })
    } catch (error) {
      console.error('Error receiving friend request:', error)
    }
  })

  socket.on('accept_friend_request', async (data) => {
    console.log('Friend request accepted:', data)
    // notifyUserId - sender of the friend request, acceptedBy - receiver of the friend request
    const { acceptedBy, notifyUserId } = data

    // Get the socketId of the friend request receiver and sender
    const receiver = await User.findById(acceptedBy).select('firstName lastName _id status avatar')
    const sender = await User.findById(notifyUserId).select('socketId')

    // Emit the event to the sender and receiver
    try {
      io.to(sender?.socketId).emit('friend_request_accepted', {
        message: 'Your friend request has been accepted',
        friend: receiver
      })
    } catch (error) {
      console.error('Error sending friend request accepted to friend request sender:', error)
    }
  })
}
