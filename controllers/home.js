const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASSWORD
	// token: process.env.SENDGRID_TOKEN
  }
});
/*
  GET /
  Home page.
*/
exports.index = (req, res) => {
  var imagePath = "http://sendloveio.imgix.net/"; 
  var shareUrl = "http://" + req.hostname + '/'; 
  res.render('home', {
    title: 'SendLove I/O',
    shortDescription: 'Set your intention today on SendLove.io.',     
    imagePath: imagePath + 'globe.gif',
    shareUrl: shareUrl
  });
};

/*
  POST /contact
  Send a contact form via Nodemailer.
*/
exports.postContact = (req, res) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  // req.assert('message', 'Message cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/');
  }

  const mailOptions = {
    to: 'joe@sendlove.io;rebecca@sendlove.io',
    from: 'sendlove.io@sendgrid.net',
    subject: 'Contact Form | SendLove I/O',
    text: `\n ${req.body.name}  \n ${req.body.email}  \n  ${req.body.message}`
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      req.flash('errors', { msg: err.message });
      return res.redirect('/');
    }
    req.flash('success', { msg: 'Thanks for being part of SendLove I/O! We will get back to you soon :)' });
    res.redirect('/');
  });
};
