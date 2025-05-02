// Description: This file is the entry point of the application.
// It imports the app from app.js.
const app = require('./app')

const mongoose = require('mongoose')
const User = require('./models/user')
const FriendRequest = require('./models/friendRequest')

// Import the dotenv package to read the .env file and store the environment variables in process.env
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

// Import the socket.io package to enable real-time communication between the client and the server
const { Server } = require('socket.io')

// As a good practice, we should not include the password inside the project environment file.
const database = process.env.DATABASEURI.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

// Connect to the database
mongoose
  .connect(database)
  .then(() => {
    console.log('DB connection successful!')
  })
  .catch((err) => {
    console.log('DB connection failed!')
    console.log(err)
  })

// Listener for specific events emitted by the process object, to handle system siganls, errors and life cycle events.
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1) // Exit code 1 -- there's some issue causing the program to exit
})

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1) // Exit code 1 -- there's some issue causing the program to exit
  })
})

// createServer method from the http module.
// http package is a built-in Node.js package.
const http = require('http')
// Create a server with http and the app
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Define the port, either from the environment which is defined as 3000, or default to 8000
const port = process.env.PORT || 8000
// Listen to the port
server.listen(port, () => {
  console.log(`App running on port ${port} ...`)
})

// Listen for when a user connects to the server via socket
io.on('connection', async (socket) => {
  console.log(JSON.stringify(socket.handshake.query))
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

  // -------------- Socket event listeners ----------------- //
  socket.on('friendRequest', async (data) => {
    console.log('Friend request received:', data)
    const receiver = await User.findById(data.receiver).select('socketId')
    const sender = await User.findById(data.sender).select('socketId')

    await FriendRequest.create({
      sender: data.sender,
      receiver: data.receiver
    })

    // Use optional chaining (?.) to safely access socketID from receiver
    // It won't throw an error if receiver is null or undefined, it just return undefined.
    io.to(receiver?.socketId).emit('new_friend_request', {
      message: 'You have a new friend request'
    })

    io.to(sender?.socketId).emit('friend_request_sent', {
      message: 'You have sent a friend request'
    })
  })
  // Listen for when a user disconnects from the server via socket
  socket.on('disconnect', async (data) => {
    // TODO: Update the user's status in the database and disconnect

    console.log('A user disconnected')
  })
})
