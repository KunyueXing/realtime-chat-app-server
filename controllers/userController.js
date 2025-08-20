const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const filterObj = require('../utils/filterObj')
const AppError = require('../utils/appError')

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
exports.getNonFriendUsers = catchAsync(async (req, res, next) => {
  // 1) Get all users
  const allUsers = await User.find({ verified: true }).select('firstName lastName _id')

  //const currUser = req.user
  const currUser = await User.findById(req.user._id).populate('friends', '_id').populate('friendRequests', 'sender receiver')

  // 2) Filter out the current user and friends, and those who have sent a friend request
  const nonFriendsUsers = allUsers.filter((user) => {
    // Check if the user is not the current user
    if (user._id.toString() === currUser._id.toString()) {
      return false
    }

    // Check if the user is not already a friend
    // Here, .some() populated objects. If use .includes(user_.id), it's quicker but less safer
    const isFriend = currUser.friends?.some((friend) => friend?._id?.toString() === user._id.toString()) || false
    if (isFriend) {
      return false
    }

    // Check if the user has sent a friend request to the current user or vice versa
    const hasSentRequest = currUser.friendRequests?.some((request) => request?.sender?.toString() === user._id.toString())
    const hasReceivedRequest = currUser.friendRequests?.some((request) => request?.receiver?.toString() === user._id.toString())
    if (hasSentRequest || hasReceivedRequest) {
      return false
    }
    return true
  })

  console.log('Not friends users:', nonFriendsUsers)

  // 3) Send response
  res.status(200).json({
    status: 'success',
    users: nonFriendsUsers,
    message: 'Users that are not friends fetched successfully'
  })
})
