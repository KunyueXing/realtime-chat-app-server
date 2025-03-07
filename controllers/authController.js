const jwt = require('jsonwebtoken')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')

// Created a signed JWT.
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Check if email and password exist
  if (!email || !password) {
    res.status(400).json({
      status: 'fail',
      message: 'Please provide both email and password'
    })
  }

  // Check if user exists and password is correct
  const currUser = await User.findOne({ email: email }).select('+password')

  // password - user input, currUser.password - hashed password stored in database
  if (!currUser || !(await currUser.correctPassword(password, currUser.password))) {
    res.status(401).json({
      status: 'error',
      message: 'Incorrect email or password'
    })
  }

  // If everything is okay, send token to client
  const token = signToken(currUser._id)
  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    token,
    user_id: currUser._id
  })
})
