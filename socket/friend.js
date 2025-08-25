const User = require('../models/user')

module.exports = async (socket, io) => {
  socket.on('friend_request', async (data) => {
    console.log('Friend request received:', data)
    // Get the socketId of the receiver and sender
    const receiver = await User.findById(data.receiver).select('socketId')
    const sender = await User.findById(data.sender).select('socketId')

    // Use optional chaining (?.) to safely access socketID from receiver
    // It won't throw an error if receiver is null or undefined, it just return undefined.
    try {
      io.to(receiver?.socketId).emit('new_friend_request', {
        message: 'You have a new friend request'
      })
    } catch (error) {
      console.error('Error receiving friend request:', error)
    }

    // try {
    //   io.to(sender?.socketId).emit('friend_request_sent', {
    //     message: 'You have sent a friend request'
    //   })
    // } catch (error) {
    //   console.error('Error sending friend request:', error)
    // }
  })

  socket.on('accept_friend_request', async (data) => {
    console.log('Friend request accepted:', data)
    const { acceptedBy, notifyUserId, requestId } = data

    // Get the socketId of the friend request receiver and sender
    const receiver = await User.findById(acceptedBy)
    const sender = await User.findById(notifyUserId)

    // Emit the event to the sender and receiver
    try {
      io.to(sender?.socketId).emit('friend_request_accepted', {
        message: 'Your friend request has been accepted'
      })
    } catch (error) {
      console.error('Error sending friend request accepted to friend request sender:', error)
    }
    // try {
    //   io.to(receiver?.socketId).emit('friend_request_accepted', {
    //     message: 'You have accepted the friend request'
    //   })
    // } catch (error) {
    //   console.error('Error sending friend request accepted to friend request receiver:', error)
    // }
  })
}
