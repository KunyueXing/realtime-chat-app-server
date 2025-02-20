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

/* 
  For security, sanitize user input. Searched any keys in objects that begin with 
  a $ or contain a . (reserved MongoDB operators), from req.body, req.query or req.params.
*/
const mongoSanitize = require('express-mongo-sanitize')

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const bodyParser = require('body-parser')

const xss = require('xss')

const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('cookie-session')

app.use(mongoSanitize())

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const limiter = rateLimit({
    max: 3000,
    windowMs: 60 * 60 * 1000, // max 3000 requests per hour
    message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)

app.use(helmet())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(
    cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    })
)

app.use(cookieParser())

app.use(
    session({
        name: 'session',
        keys: ['key1', 'key2'],
        maxAge: 24 * 60 * 60 * 1000
    })
)

module.exports = app