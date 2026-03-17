const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

const resetPasswordTemplate = (resetUrl, userName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0f0f0f; margin: 0; padding: 40px 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid #2a2a4a; }
    h1 { color: #e879f9; font-size: 24px; margin-bottom: 8px; }
    p { color: #a1a1aa; line-height: 1.6; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #e879f9); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0; }
    .footer { color: #52525b; font-size: 12px; margin-top: 24px; border-top: 1px solid #2a2a4a; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔗 HookLinks</h1>
    <p>Hi <strong style="color:#e4e4e7">${userName}</strong>,</p>
    <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong style="color:#e4e4e7">1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <div class="footer">This link will expire in 1 hour. Do not share this email.</div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, resetPasswordTemplate };
