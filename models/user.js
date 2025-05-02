const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Firstname is required!']
  },
  lastName: {
    type: String,
    required: [true, 'Lastname is required!']
  },
  about: {
    type: String
  },
  avatar: {
    type: String
  },
  email: {
    type: String,
    required: [true, 'Email address is required!'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
      },
      message: (props) => `Email (${props.value}) is invalid!`
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 6
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function (el) {
        return el === this.password
      },
      message: 'Passwords are not the same!'
    },
    select: false // This prevents the field from being stored in the database
  },
  // The time at which the password was changed. Used for JWT creation
  // If the password was changed after the JWT was issued, the user must log in again
  // This is a security feature
  passwordChangedAt: {
    type: Date
  },
  // The password reset token
  passwordResetToken: {
    type: String
  },
  // The time at which the password reset token expires
  passwordResetExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['online', 'offline']
  }, // If the user is online or not
  verified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otp_expiry_time: {
    type: Date
  },
  socketId: {
    type: String
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

userSchema.pre('save', async function (next) {
  // Only run this function if otp was actually modified
  if (!this.isModified('otp') || !this.otp) {
    return next()
  }

  // Hash the password with cost of 12
  this.otp = await bcrypt.hash(this.otp.toString(), 12)

  console.log(this.otp.toString(), 'From pre save hook')
  next()
})

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password') || !this.password) {
    return next()
  }

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)

  // Delete the passwordConfirm field
  this.passwordConfirm = undefined
  next()
})

userSchema.pre('save', function (next) {
  // If the password was not modified, return
  if (!this.isModified('password') || this.isNew || !this.password) {
    return next()
  }

  // Subtract 1 second to make sure the token expires before the password is changed
  this.passwordChangedAt = Date.now() - 1000
  next()
})

// Checks if candidatePassword matches userPassword (which is a hashed password stored in the database)
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

// Checks if candidateOTP matches userOTP (which is a hashed OTP stored in the database)
userSchema.methods.correctOTP = async function (candidateOTP, userOTP) {
  return await bcrypt.compare(candidateOTP, userOTP)
}

userSchema.methods.createPasswordResetToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex')

  // Hash the token and store it in the database
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Set the password reset token to expire after 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

// Check if the user changed the password after the JWT was issued
userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

    return JWTTimestamp < changedTimestamp
  }

  // False means NOT changed
  return false
}

const User = new mongoose.model('User', userSchema)
module.exports = User
