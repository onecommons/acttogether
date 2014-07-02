var url = require('url');
var path = require('path');

var nodemailer = require('nodemailer');
var swig  = require('swig');

// Hand-waving required to render swig templates without breaking the main app
var templatePath = path.join(__dirname + "/../views")
// console.log("using template path:" + templatePath);
var myswig = new swig.Swig({ loader: swig.loaders.fs(templatePath) });

var loadConfig = require('./config');
var config = loadConfig('email');

module.exports.sendWelcome = function(user) {
  sendMessage(config.templates.signup, user);
}

module.exports.resendVerification = function(user) {
  sendMessage(config.templates.resend, user);
}

module.exports.sendForgot = function(user) {
  sendMessage(config.templates.forgot, user);
}

function createTransport() {
  var cfg = config.mailer;
  // console.log("Creating mailer with transport:" + cfg.transport);
  // console.log(cfg);
  return nodemailer.createTransport(cfg.transport, cfg.config);
}

// XXX needs a way to indicate an error
function sendMessage(template, user) {

  // XXX how to confirm the structure of the template? missing fields will cause errors

  // XXX need a better way to generate link
  var link = url.resolve(config.templates.appurl, "/verification/" + user.local.signupToken);

  var emailVars = {
    'appname': config.templates.appname,
    'appurl': config.templates.appurl,
    'link': link
  }

  var msgSubject = myswig.render(template.subject, {locals:emailVars}); // WTF swig?
  var msgBody    = myswig.renderFile(template.templatePath, emailVars);

  var transport = createTransport();

  var message = {
      generateTextFromHTML: true,

      from: config.templates.from, // XXX move this out of 'templates'
      to: user.local.email,
      subject: msgSubject,
      html: msgBody
  }

  console.log(message);

  // XXX what to do with callback?

  // send mail with defined transport object
  transport.sendMail(message, function(error, response){
    if (error) {
      console.log("Error sending mail!")
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
      console.log(JSON.stringify(response));
    }

    // if you don't want to use this transport object anymore, uncomment following line
    transport.close(); // shut down the connection pool, no more messages
  });  


}
