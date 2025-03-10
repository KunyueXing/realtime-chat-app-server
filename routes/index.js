const router = require('express').Router()

const authRouter = require('./auth')

router.use('/auth', authRouter)

model.exports = router
