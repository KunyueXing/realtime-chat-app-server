const router = require('express').Router()
const authController = require('../controllers/authController')

router.post('/register', authController.register, authController.sendOTP)
router.post('/login', authController.login)
router.post('/verify', authController.verifyOTP)
// In most applications, this is provided for resending the OTP in case the user didn't receive it the first time.
// This can be used in the frontend to resend the OTP
router.post('/send-otp', authController.sendOTP)

router.post('/forgot-password', authController.forgotPassword)
router.patch('/reset-password', authController.resetPassword)

module.exports = router
