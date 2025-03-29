const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const Mailgun = require('mailgun.js')
const FormData = require('form-data')

const mailgun = new Mailgun(FormData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
})

const sendMailgunEmail = async ({ to, subject, content, html, otp }) => {
  try {
    const sender = process.env.MAILGUN_DOMAIN

    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      throw new Error('Mailgun API key or domain is missing in .env file')
    }

    const data = {
      from: `ChatElephant App <no-reply@${sender}>`,
      to: to,
      subject: subject,
      text: `${content} The one time password is ${otp}. Note:It will expire in 10 minutes.`,
      html: html
    }

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, data)
    console.log('Mailgun response:', response)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

exports.sendEmail = async (args) => {
  console.log('sendEmail() function called with args:', args)
  // If the environment is development, log the email details to the console
  // instead of sending the email. This is useful for testing purposes
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log('Development environment detected. Email not sent.')
    return Promise.resolve()
  } else {
    return sendMailgunEmail(args)
  }
}
