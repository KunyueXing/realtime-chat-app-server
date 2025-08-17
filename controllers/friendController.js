const FriendRequest = require('../models/friendRequest')

// Function to send a friend request
exports.sendFriendRequest = async (req, res, next) => {
  const { receiverId, senderId } = req.body

  try {
    // Check if the friend request already exists
    const existingRequest = await FriendRequest.findOne({ senderId, receiverId })
    if (existingRequest) {
      return res.status(409).json({
        status: 'fail',
        message: 'Friend request already sent'
      })
    }

    // Create a new friend request
    const newRequest = await FriendRequest.create({ sender: senderId, receiver: receiverId })

    res.status(201).json({
      status: 'success',
      data: {
        friendRequest: newRequest
      },
      message: 'Friend request sent successfully'
    })
  } catch (error) {
    console.error('Error creating friend request:', error)
  }
}
