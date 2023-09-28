const nodemailer =require("nodemailer");
const path = require("path");
const Mail = async (email,verificationToken) => {
    try {
        let mailOptions = {
          from: 'abhishekra213@gmail.com',
          to: 'abhishekra000005@gmail.com',
          subject: 'Hello from Node.js',
          text: `Click the following link to verify your email: http://localhost:7000/api/v1/verify/${verificationToken}`,
        }

        sendEmailWithRetry(mailOptions,3);
      } catch (error) {
        console.error(error);
          }
  };

  function sendEmailWithRetry(mailOptions,retryCount) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'abhishekra213@gmail.com',
        pass: 'ztkicxdyylxpozoy'
      }
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        if (retryCount > 0) {
          console.log(`Retrying in 5 seconds (Attempt left${retryCount-1})...`);
          setTimeout(() => {
            sendEmailWithRetry(retryCount - 1);
          }, 5000);
        } else {
          console.log('Maximum retry attempts reached. Email could not be sent.');
        }
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
  module.exports = Mail;