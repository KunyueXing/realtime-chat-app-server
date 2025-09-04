const FriendRequest = require('../models/friendRequest')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')

// Function to send a friend request
exports.sendFriendRequest = catchAsync(async (req, res, next) => {
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
    // Add the friend request to the sender's and receiver's friendRequests array
    await User.findByIdAndUpdate(senderId, { $addToSet: { friendRequests: newRequest._id } }, { new: true, upsert: true })
    await User.findByIdAndUpdate(receiverId, { $addToSet: { friendRequests: newRequest._id } }, { new: true, upsert: true })

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
})

// Get all friend requests sent to the current user
exports.getFriendRequests = catchAsync(async (req, res, next) => {
  const friend_requests = await FriendRequest.find({ receiver: req.user._id }).populate('sender', 'firstName lastName _id avatar status')

  console.log('friend requests:', friend_requests)

  res.status(200).json({
    status: 'success',
    data: {
      requests: friend_requests
    },
    message: 'Friend requests fetched successfully'
  })
})

// Get all users that are friends with the current user
exports.getFriends = catchAsync(async (req, res, next) => {
  const curr_user = await User.findById(req.user._id).populate('friends', 'firstName lastName _id avatar status')

  console.log('friends users:', curr_user.friends)

  res.status(200).json({
    status: 'success',
    data: {
      users: curr_user.friends
    },
    message: 'Users that are friends fetched successfully'
  })
})

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.body

  try {
    // Find the friend request AND populate the sender field
    const friendRequest = await FriendRequest.findById(requestId).populate('sender', 'firstName lastName _id avatar online')
    console.log('accept friend request:', friendRequest)
    console.log('friendrequest sender:', friendRequest.sender)

    if (!friendRequest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Friend request not found'
      })
    }
    // Add the sender'id and receiver'id to each other's friends list
    await User.findByIdAndUpdate(friendRequest.sender._id, {
      $addToSet: { friends: friendRequest.receiver }
    })
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender._id }
    })
    // Remove the friend request from the database
    await FriendRequest.findByIdAndDelete(requestId)
    // Remove the friend request from the sender's and receiver's friendRequests array
    await User.findByIdAndUpdate(friendRequest.sender._id, { $pull: { friendRequests: requestId } })
    await User.findByIdAndUpdate(friendRequest.receiver, { $pull: { friendRequests: requestId } })

    res.status(200).json({
      status: 'success',
      message: 'Friend request accepted successfully',
      data: {
        requestSender: friendRequest.sender
      }
    })
  } catch (error) {
    console.error('Error accepting friend request:', error)
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while accepting the friend request'
    })
  }
})

exports.rejectFriendRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.body

  try {
    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId)
    if (!friendRequest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Friend request not found'
      })
    }
    // Remove the friend request from the database
    await FriendRequest.findByIdAndDelete(requestId)
    // Remove the friend request from the sender's and receiver's friendRequests array
    await User.findByIdAndUpdate(friendRequest.sender, { $pull: { friendRequests: requestId } })
    await User.findByIdAndUpdate(friendRequest.receiver, { $pull: { friendRequests: requestId } })

    res.status(200).json({
      status: 'success',
      message: 'Friend request rejected successfully'
    })
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while rejecting the friend request'
    })
  }
})
