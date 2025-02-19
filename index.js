// Description: This file is the entry point of the application.
// It imports the app from app.js.
const app = require('./app')

// createServer method from the http module. 
// http package is a built-in Node.js package.
const http = require('http')
// Create a server with http and the app
const server = http.createServer(app)