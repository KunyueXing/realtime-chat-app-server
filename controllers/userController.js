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
