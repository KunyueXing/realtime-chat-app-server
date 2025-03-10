const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendSGEmail = async ({ to, sender, subject, html, attachments, text }) => {
  try {
    const from = sender || process.env.EMAIL_FROM
    const msg = {
      to: to,
      from: from,
      subject: subject,
      html: html,
      text: text,
      attachments
    }

    // Send the email. This is asynchronous, so it returns a promise
    return sgMail.send(msg)
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
    return sendSGEmail(args)
  }
}
