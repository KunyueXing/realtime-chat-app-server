// Description: This file is the entry point of the application.
// It imports the app from app.js.
const app = require('./app')

// Import the dotenv package to read the .env file and store the environment variables in process.env
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

// Listener for specific events emitted by the process object, to handle system siganls, errors and life cycle events.
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1) // Exit code 1 -- there's some issue causing the program to exit
})

process.on('unhandledRejection', err => {
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

// Define the port, either from the environment which is defined as 3000, or default to 8000
const port = process.env.PORT || 8000
// Listen to the port
server.listen(port, () => {
  console.log(`App running on port ${port} ...`)
})
