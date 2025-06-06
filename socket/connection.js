const User = require('../models/user')
const friendHandler = require('./friend')
const oneToOneMsgHandler = require('./message')

module.exports = async (socket, io) => {
  console.log('user connection: ', JSON.stringify(socket.handshake.query))
  const user_id = socket.handshake.query['user_id']
  console.log(`User with id ${user_id} connected, socket id: ${socket.id}`)

  // If the user_id is not null and can be converted to a true boolean (truthy, e,g. not empty
  // string, not 0, not false, not undefined, not NaN, not null), then update the user's socketId
  // in the database
  if (user_id != null && Boolean(user_id)) {
    try {
      // Update the user's socketId in the database
      await User.findByIdAndUpdate(user_id, {
        socketId: socket.id,
        status: 'online'
      })
    } catch (err) {
      console.log(err)
    }
  }

  // TODO: Handlers for socket events
  friendHandler(socket, io)
  oneToOneMsgHandler(socket, io)

  socket.on('disconnect', async () => {
    // Update the user's socketId and status in the database
    await User.findByIdAndUpdate(user_id, {
      socketId: null,
      status: 'offline'
    })
    socket.disconnect()
    console.log(`User with id ${user_id} disconnected, socket id: ${socket.id}`)
  })
}
