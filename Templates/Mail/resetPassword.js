module.exports = function resetPasswordTemplate(name, link) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Please click the button below to reset your password.</p>
        <p><strong>Note:</strong> this link is valid for only 10 minutes.</p>

        <a href="${link}" 
          style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>

        <p style="margin-top: 30px;">Thanks,<br/>ChatElephant Team</p>
      </div>
    </body>
    </html>
  `
}
