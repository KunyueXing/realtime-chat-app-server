// Express server
// Run with: node app.js
const express = require('express')
const app = express()

// Middleware
const morgan = require('morgan')

// For security, limit repeated requests to public APIs
const rateLimit = require('express-rate-limit')
// For security, set HTTP response headers
const helmet = require('helmet')

const routes = require('./routes/index')

/* 
  For security, sanitize user input. Searched any keys in objects that begin with 
  a $ or contain a . (reserved MongoDB operators), from req.body, req.query or req.params.
*/
const mongoSanitize = require('express-mongo-sanitize')

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const bodyParser = require('body-parser')

// Middleware to prevent cross-site scripting (XSS) attacks
const xss = require('xss')

// Middleware to enable Cross-Origin Resource Sharing (CORS)
const cors = require('cors')

// Middleware to parse cookies from the HTTP request
const cookieParser = require('cookie-parser')

// Middleware for handling sessions using cookies
// Sessions are used to store data about a user's interaction with the web application across multiple requests
const session = require('cookie-session')

// Sanitize user input
app.use(mongoSanitize())

// Parse JSON and URL-encoded data from incoming requests
// Sets a limit on the size of the JSON payload that can be parsed to be '10kb', to prevent DOS attacks
app.use(express.json({ limit: '10kb' }))

/* 
  Parse incoming requests with URL-encoded payloads, typically used for form submissions. Extended set to 
  true allows for nested objects in the URL-encoded data
*/
app.use(express.urlencoded({ extended: true }))

// Parse application/x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: true }))

// Parse application/json data
app.use(bodyParser.json())

// Limit repeated requests to public APIs to prevent abuse
const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // max 3000 requests per hour
  message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)

// Set security-related HTTP response headers
app.use(helmet())

// Use morgan for logging HTTP requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Enable Cross-Origin Resource Sharing (CORS) for all origins
app.use(
  cors({
    origin: '*', // Allow requests from any origin.
    credentials: true, // Allow cookies and other credentials to be sent in cross-origin requests.

    // Specifies the HTTP methods that are allowed to be used when making requests to the server
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  })
)

// Parse cookies from incoming requests
app.use(cookieParser())

// Handle sessions using cookies
app.use(
  session({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000 // Session duration: 24 hours
  })
)

app.use(routes)

module.exports = app
