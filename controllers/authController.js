const jwt = require('jsonwebtoken')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const filterObj = require('../utils/filterObj')

// Created a signed JWT.
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

exports.register = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'password')

  const currUser = await User.findOne({ email: filteredBody.email })

  if (currUser && currUser.verified) {
    // Email already exists and verified
    res.status(400).json({
      status: 'fail',
      message: 'User already exists'
    })
  } else if (currUser) {
    // If the user exists but is not verified, send the verification email again
  } else {
    // Create a new user
    const newUser = await User.create(filteredBody)
    const token = signToken(newUser._id)

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      token,
      user_id: newUser._id
    })
  }
})

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
