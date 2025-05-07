const User = require('../models/user')
const FriendRequest = require('../models/friendRequest')

module.exports = async (socket, io) => {
  socket.on('friend_request', async (data) => {
    console.log('Friend request received:', data)
    // Get the socketId of the receiver and sender
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

  socket.on('accept_friend_request', async (data) => {
    console.log('Friend request accepted:', data)
    const friendRequest = await FriendRequest.findById(data.request_id)
    console.log('Friend request:', friendRequest)

    // Get the socketId of the receiver and sender
    const receiver = await User.findById(friendRequest.receiver)
    const sender = await User.findById(friendRequest.sender)

    // Add the sender and receiver to each other's friends list
    try {
      await User.findByIdAndUpdate(friendRequest.sender, {
        $addToSet: { friends: friendRequest.receiver }
      })
    } catch (error) {
      console.error('Error updating friends to sender:', error)
    }

    try {
      await User.findByIdAndUpdate(friendRequest.receiver, {
        $addToSet: { friends: friendRequest.sender }
      })
    } catch (error) {
      console.error('Error updating friends to receiver:', error)
    }

    // Remove the friend request from the database
    try {
      await FriendRequest.findByIdAndDelete(data.request_id)
    } catch (error) {
      console.error('Error deleting friend request:', error)
    }

    // Emit the event to the sender and receiver
    try {
      io.to(receiver?.socketId).emit('friend_request_accepted', {
        message: 'Your friend request has been accepted'
      })
    } catch (error) {
      console.error('Error sending friend request accepted to receiver:', error)
    }
    try {
      io.to(sender?.socketId).emit('friend_request_accepted', {
        message: 'You have accepted the friend request'
      })
    } catch (error) {
      console.error('Error sending friend request accepted to sender:', error)
    }
  })
}
