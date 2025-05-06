const User = require('../models/user')
const FriendRequest = require('../models/friendRequest')

module.exports = async (socket, io) => {
  socket.on('friendRequest', async (data) => {
    console.log('Friend request received:', data)
    const receiver = await User.findById(data.receiver).select('socketId')
    const sender = await User.findById(data.sender).select('socketId')

    await FriendRequest.create({
      sender: data.sender,
      receiver: data.receiver
    })

    // Use optional chaining (?.) to safely access socketID from receiver
    // It won't throw an error if receiver is null or undefined, it just return undefined.
    try {
      io.to(receiver?.socketId).emit('new_friend_request', {
        message: 'You have a new friend request'
      })
    } catch (error) {
      console.error('Error sending friend request:', error)
    }

    try {
      io.to(sender?.socketId).emit('friend_request_sent', {
        message: 'You have sent a friend request'
      })
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  })
}
