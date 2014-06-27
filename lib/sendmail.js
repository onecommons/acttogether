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
console.log("loaded mail config:");
console.log(config);

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
  // console.log(cfg);
  return nodemailer.createTransport(cfg.transportType, cfg.config);
}

function sendMessage(template, user) {

  // XXX does app provide a way to generate a link from a route name?
  var link = url.resolve(config.templates.appurl, "/verification/" + user.local.signupToken);
  console.log("verification URL:" + link);

  // XXX need to do template replacement on subject also
  var msgBody = myswig.renderFile(template.templatePath, {
    'appname': config.templates.appname,
    'appurl': config.templates.appurl,
    'link': link
  });

  var transport = createTransport();

  var message = {
      generateTextFromHTML: true,

      from: config.templates.from, // XXX move this out of 'templates'
      to: user.local.email,
      subject: template.subject,
      // text: "Create a text body as well?"
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
