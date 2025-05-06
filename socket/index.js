const onConnection = require('./connection')

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Call the onConnection function to handle the connection
    onConnection(socket, io)
  })
}
