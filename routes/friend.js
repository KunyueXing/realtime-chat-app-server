const router = require('express').Router()
const authController = require('../controllers/authController')
const friendController = require('../controllers/friendController')

router.post('/requests', authController.protect, friendController.sendFriendRequest)

module.exports = router
