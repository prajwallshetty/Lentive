const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP options are configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL) {
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

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Lentive'} <${process.env.FROM_EMAIL || 'noreply@lentive.com'}>`,
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
