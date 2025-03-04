const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'vikrambm.official@gmail.com',
      pass: 'bbeewcbjtmzzyfdc',
    },
  });

  const mailOptions = {
    from: 'vikrambm.official@gmail.com',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
