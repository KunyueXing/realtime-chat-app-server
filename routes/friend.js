const router = require('express').Router()
const authController = require('../controllers/authController')
const friendController = require('../controllers/friendController')

router.post('/requests', authController.protect, friendController.sendFriendRequest)
router.post('/requests/:requestId/accept', authController.protect, friendController.acceptFriendRequest)
router.get('/requests', authController.protect, friendController.getFriendRequests)
router.get('', authController.protect, friendController.getFriends)
router.post('/requests/:requestId/reject', authController.protect, friendController.rejectFriendRequest)

module.exports = router
