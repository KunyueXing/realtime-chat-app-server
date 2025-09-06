const router = require('express').Router()

const authRouter = require('./auth')
const userRouter = require('./user')
const friendRouter = require('./friend')

router.use('/api/v1/auth', authRouter)
router.use('/api/v1/user', userRouter)
router.use('/api/v1/friends', friendRouter)

module.exports = router
