const router = require('express').Router()
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

router.patch('/update-me', authController.protect, userController.updateMe)
router.get('/non-friends', authController.protect, userController.getNonFriendUsers)

module.exports = router
