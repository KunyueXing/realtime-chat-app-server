const router = require('express').Router()

const authRouter = require('./auth')
const userRouter = require('./user')
const friendRouter = require('./friend')

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/friends', friendRouter)

module.exports = router
