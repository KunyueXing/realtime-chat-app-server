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
  const friend_requests = await FriendRequest.find({ receiver: req.user._id }).populate('sender', 'firstName lastName _id')

  // For testing purposes
  // const friend_requests = [
  //   {
  //     firstName: 'Jenny',
  //     lastName: 'Li',
  //     _id: 'sdkfjl;kdsjalkjsa;fj',
  //     avatar: 'lksdjafklsj;dkfjsa;',
  //     online: true
  //   },
  //   {
  //     firstName: 'Ben',
  //     lastName: 'Ma',
  //     _id: 'sdkfjl;kdsjalsa;fj',
  //     avatar: 'lksdjafklsj;dkfjsa;',
  //     online: true
  //   }
  // ]
  console.log('friend requests:', friend_requests)

  res.status(200).json({
    status: 'success',
    users: friend_requests,
    message: 'Friend requests fetched successfully'
  })
})

// Get all users that are friends with the current user
exports.getFriends = catchAsync(async (req, res, next) => {
  const curr_user = await User.findById(req.user._id).populate('friends', 'firstName lastName _id')

  // For testing purposes
  // const friends_list = [
  //   {
  //     firstName: 'Jenny',
  //     lastName: 'Li',
  //     _id: 'sdkfjl;kdsjalkjsa;fj',
  //     avatar: 'lksdjafklsj;dkfjsa;',
  //     online: true
  //   },
  //   {
  //     firstName: 'Ben',
  //     lastName: 'Ma',
  //     _id: 'sdkfjl;kdsjalsa;fj',
  //     avatar: 'lksdjafklsj;dkfjsa;',
  //     online: true
  //   }
  // ]
  console.log('friends users:', curr_user.friends)

  res.status(200).json({
    status: 'success',
    users: curr_user.friends,
    message: 'Users that are friends fetched successfully'
  })
})

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
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
    // Add the sender and receiver to each other's friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver }
    })
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender }
    })
    // Remove the friend request from the database
    await FriendRequest.findByIdAndDelete(requestId)

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
