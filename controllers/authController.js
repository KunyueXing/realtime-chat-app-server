const jwt = require('jsonwebtoken')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const filterObj = require('../utils/filterObj')
const otpGenerator = require('otp-generator')

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

    req.userId = newUser._id
    next()
  }
})

// Send an OTP to the user's email
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { userId } = req

  // Generate a 6-digit OTP with only digits
  const new_otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })

  const otp_expiry_time = Date.now() + 15 * 60 * 1000 // 15 minutes

  // await User.findByIdAndUpdate(userId, { otp: new_otp, otp_expiry_time })
  const currUser = await User.findByIdAndUpdate(userId, { otp_expiry_time })
  currUser.otp = new_otp.toString()
  // Save with validation and pre-save hook
  await currUser.save({ new: true, validateModifiedOnly: true })
  console.log(new_otp)

  // TODO: Send the OTP to the user's email

  res.status(200).json({
    status: 'success',
    message: 'OTP sent successfully'
  })
})

// Verify the OTP and update the user's verified status
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body

  // Search for the user with the email and the OTP expiry time is greater than the current time
  // If OTP expired or user email doesn't exist, return null
  const currUser = await User.findOne({ email, otp_expiry_time: { $gt: Date.now() } })

  if (!currUser) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email is invalid or OTP expired'
    })
  }

  if (currUser.verified) {
    return res.status(400).json({
      status: 'error',
      message: 'Email already verified'
    })
  }

  if (!(await currUser.correctOTP(otp, currUser.otp))) {
    return res.status(400).json({
      status: 'error',
      message: 'Incorrect OTP'
    })
  }

  // When the OTP is correct, update the user's verified status
  currUser.verified = true
  currUser.otp = undefined
  await currUser.save({ new: true, validateModifiedOnly: true })

  const token = signToken(currUser._id)

  res.status(200).json({
    status: 'success',
    message: 'OTP verified successfully',
    token,
    user_id: currUser._id
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Check if email and password exist
  if (!email || !password) {
    res.status(400).json({
      status: 'fail',
      message: 'Please provide both email and password'
    })
    return
  }

  // Check if user exists and password is correct
  const currUser = await User.findOne({ email: email }).select('+password')

  // password - user input, currUser.password - hashed password stored in database
  if (!currUser || !(await currUser.correctPassword(password, currUser.password))) {
    res.status(401).json({
      status: 'error',
      message: 'Incorrect email or password'
    })
    return
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

// To make sure that only users who are logged in can access certain routes
exports.protect = catchAsync(async (req, res, next) => {})

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on POSTed email
  const currUser = await User.findOne({ email: req.body.email })
  if (!currUser) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is no user with email address'
    })
  }

  // 2 Generate the random reset token
  const resetToken = currUser.createPasswordResetToken()
  await currUser.save({ validateBeforeSave: false })

  // 3 Send it to user's email
  try {
    const resetURL = `http://localhost:3000/auth/new-password?token=${resetToken}`
    console.log(resetURL)

    // TODO: Send the email

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    })
  } catch (err) {
    currUser.passwordResetToken = undefined
    currUser.passwordResetExpires = undefined
    await currUser.save({ validateBeforeSave: false })

    return res.status(500).json({
      status: 'error',
      message: 'There was an error sending the email. Try again later!'
    })
  }
})
