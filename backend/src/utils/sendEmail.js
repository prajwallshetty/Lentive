const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Check if Gmail OAuth2 options are configured
  if (process.env.MAIL_USER && process.env.MAIL_CLIENT_ID && process.env.MAIL_CLIENT_SECRET) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.MAIL_CLIENT_ID,
        clientSecret: process.env.MAIL_CLIENT_SECRET,
        refreshToken: process.env.MAIL_REFRESH_TOKEN,
        accessToken: process.env.MAIL_ACCESS_TOKEN
      }
    });
  } else if (process.env.SMTP_HOST && process.env.SMTP_EMAIL) {
    // Create transporter using standard SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Simulated fallback
    const divider = '='.repeat(80);
    console.log('\n' + divider);
    console.log('                 SIMULATED EMAIL OUTBOX (SMTP NOT CONFIGURED)');
    console.log(divider);
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log(divider + '\n');
    return { simulated: true };
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Lentive'} <${process.env.MAIL_USER || process.env.SMTP_EMAIL || 'noreply@lentive.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message.replace(/\n/g, '<br>')
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports = sendEmail;

