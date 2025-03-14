const mailgun = require('mailgun.js')
const dotenv = require('dotenv')
dotenv.config({ path: '../config.env' })

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})

const sendMailgunEmail = async ({ to, subject, text, otp }) => {
  try {
    const sender = process.env.EMAIL_FROM

    const data = {
      from: `ChatElephant App <no-reply@${sender}>`,
      to: to,
      subject: subject,
      text: `${text}, the one time password for ${subject} is ${otp}`
    }

    await mg.messages.create(process.env.MAILGUN_DOMAIN, data)
    console.log(data)
  } catch (error) {
    console.log(error)
  }
}

exports.sendEmail = async (args) => {
  // If the environment is development, log the email details to the console
  // instead of sending the email. This is useful for testing purposes
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log(args)
    return Promise.resolve()
  } else {
    return sendMailgunEmail(args)
  }
}
