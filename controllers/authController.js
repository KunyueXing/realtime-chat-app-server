const jwt = require('jsonwebtoken')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const filterObj = require('../utils/filterObj')
const otpGenerator = require('otp-generator')
const { promisify } = require('util')
const mailService = require('../services/mailer')
const crypto = require('crypto')
const resetPassword = require('../Templates/Mail/resetPassword')
// Created a signed JWT.
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

exports.register = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'password', 'passwordConfirm')

  const currUser = await User.findOne({ email: filteredBody.email })

  if (currUser && currUser.verified) {
    // Email already exists and verified
    res.status(400).json({
      status: 'fail',
      message: 'User already exists'
    })
  } else if (currUser) {
    // If the user exists but is not verified, send the verification email again
    await User.findByIdAndUpdate(currUser._id, filteredBody, {
      new: true,
      validateModifiedOnly: true
    })

    req.userId = currUser._id
    next()
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

  const otp_expiry_time = Date.now() + 10 * 60 * 1000 // 10 minutes

  // await User.findByIdAndUpdate(userId, { otp: new_otp, otp_expiry_time })
  const currUser = await User.findByIdAndUpdate(userId, { otp_expiry_time })
  currUser.otp = new_otp.toString()
  // Save with validation and pre-save hook
  await currUser.save({ new: true, validateModifiedOnly: true })
  console.log(new_otp)

  // TODO: Send the OTP to the user's email
  mailService
    .sendEmail({
      to: currUser.email,
      subject: 'Email Verification for ChatElephant',
      content: 'Congratulations! You are almost set to start using ChatElephant.',
      html: '',
      otp: new_otp
    })
    .then(() => {
      console.log('Email sent successfully')

      res.status(200).json({
        status: 'success',
        message: 'OTP sent successfully'
      })
    })
    .catch((err) => {
      console.log(err)

      res.status(500).json({
        status: 'error',
        message: 'There was an error sending the verification email. Try again later!'
      })
    })
})

// Verify the OTP and update the user's verified status
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const email = req.body.email.trim().toLowerCase()
  const otp = req.body.otp
  // console.log('Verifying email:', email)

  // Search for the user with the email
  const currUser = await User.findOne({ email })

  if (!currUser) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email is invalid'
    })
  }

  if (currUser.verified) {
    return res.status(400).json({
      status: 'error',
      message: 'Email already verified'
    })
  }

  if (currUser.otp_expiry_time < Date.now()) {
    return res.status(400).json({
      status: 'error',
      message: 'OTP expired'
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
  currUser.otp = null
  await currUser.save({ validateModifiedOnly: true })

  // Check if can read data from the database
  // const allUsers = await User.find({})
  // console.log(
  //   'All users in DB:',
  //   allUsers.map((u) => u.email)
  // )

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

  // TODO: Check if email is verified. If not, send the verification email again

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
exports.protect = catchAsync(async (req, res, next) => {
  // 1 Getting token and check if it's there
  let token

  // Usually, the JWT token was sent to the server by using Bearer Authentication
  // There's another way to send the JWT token to the server, which is by using cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in! Please log in to get access.'
    })
  }

  // 2 Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  console.log(decoded)

  // 3 Check if user still exists
  const currUser = await User.findById(decoded.userId)

  if (!currUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'The user belonging to this token does no longer exist.'
    })
  }

  // 4 Check if user changed password after the token was issued
  // iat - timestamp that the token was issued at
  if (currUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      status: 'fail',
      message: 'User recently changed password! Please log in again.'
    })
  }

  // Grant access to protected route
  req.user = currUser
  next()
})

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
  console.log('resetToken: ', resetToken)
  await currUser.save({ validateBeforeSave: false })

  // 3 Send it to user's email
  try {
    const resetURL = `http://localhost:3000/auth/new-password?token=${resetToken}`
    console.log(resetURL)

    // TODO: Send the email
    mailService.sendEmail({
      to: currUser.email,
      subject: 'Reset Password',
      content: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.`,
      html: resetPassword(currUser.firstName, resetURL),
      otp: resetToken
    })

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

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on the token
  // req.params.token → the token in the URL path (e.g., /resetPassword/:token).
  // req.body.token → the token in the request body (e.g., { token: '...token...' }).
  const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex')

  const currUser = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  // 2 If token has not expired, and there is user, set the new password
  if (!currUser) {
    return res.status(400).json({
      status: 'fail',
      message: 'Token is invalid or has expired'
    })
  }

  // 3 Update passward reset related properties for the user
  currUser.password = req.body.password
  currUser.passwordConfirm = req.body.password
  currUser.passwordResetToken = undefined
  currUser.passwordResetExpires = undefined
  await currUser.save()

  // TODO: Send the email to user that the password has been changed

  // 4 Log the user in, send JWT
  const token = signToken(currUser._id)
  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    token
  })
})
