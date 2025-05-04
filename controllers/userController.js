const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const filterObj = require('../utils/filterObj')
const AppError = require('../utils/appError')
const FriendRequest = require('../models/friendRequest')

exports.updateMe = catchAsync(async (req, res, next) => {
  // This user is coming from the protect middleware, which means the user is logged in
  const { user } = req

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400))
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'about')
  if (req.file) {
    filteredBody.photo = req.file.filename
  }

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(user._id, filteredBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    message: 'User data updated successfully',
    data: {
      user: updatedUser
    }
  })
})

// Get all users that are not friends with the current user
exports.getUsers = catchAsync(async (req, res, next) => {
  // 1) Get all users
  const all_users = await User.find({ verified: true }).select('firstName lastName _id')

  const curr_user = req.user

  // 2) Filter out the current user and friends, and those who have sent a friend request
  const not_friends_users = all_users.filter((user) => {
    // Check if the user is not the current user
    if (user._id.toString() === curr_user._id.toString()) {
      return false
    }

    // Check if the user is not already a friend
    // Here, .some() populated objects. If use .includes(user_.id), it's quicker but less safer
    const isFriend = curr_user.friends.some((friend) => friend._id.toString() === user._id.toString())
    if (isFriend) {
      return false
    }

    // Check if the user has sent a friend request to the current user or vice versa
    // const hasSentRequest = curr_user.friendRequests.some((request) => request.sender._id.toString() === user._id.toString() || request.receiver._id.toString() === user._id.toString())
    // if (hasSentRequest) {
    //   return false
    // }

    return true
  })

  // 3) Send response
  res.status(200).json({
    status: 'success',
    data: not_friends_users,
    message: 'Users that are not friends fetched successfully'
  })
})

// Get all users that are friends with the current user
exports.getFriends = catchAsync(async (req, res, next) => {
  const friends_list = await User.findById(req.user._id).populate('friends', 'firstName lastName _id')

  res.status(200).json({
    status: 'success',
    data: friends_list,
    message: 'Users that are friends fetched successfully'
  })
})

// Get all friend requests sent to the current user
exports.getFriendRequests = catchAsync(async (req, res, next) => {
  const friend_requests = await FriendRequest.find({ receiver: req.user._id }).populate('sender', 'firstName lastName _id')

  res.status(200).json({
    status: 'success',
    data: friend_requests,
    message: 'Friend requests fetched successfully'
  })
})
