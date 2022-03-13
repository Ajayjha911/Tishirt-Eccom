// const nodemailer = require("nodemailer");
// require("dotenv").config();
// // const { options } = require("../routes/user");

// const mailHelper = async (option) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,

//     auth: {
//       user: process.env.SMTP_USER, // generated ethereal user
//       pass: process.env.SMTP_PASS, // generated ethereal password
//     },
//   });

//   const message = {
//     from: "ajay@gmail.com", // sender address
//     to: option.email, // list of receivers
//     subject: option.subject, // Subject line
//     text: option.message, // plain text body
//     // html: "<a>Hello world?</a>", // html body
//   };
//   // send mail with defined transport object
//   await transporter.sendMail(message);
// };

// module.exports = mailHelper;

const nodemailer = require("nodemailer");

const mailHelper = async (option) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d93f0e02829130",
      pass: "6dbcc8ae745263",
    },
  });

  const message = {
    from: "hitesh@lco.dev", // sender address
    to: option.email, // list of receivers
    subject: option.subject, // Subject line
    text: option.message, // plain text body
  };

  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailHelper;
