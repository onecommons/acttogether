// config/email.js

module.exports = {
    "mailer": { // nodemailer config vars
        "transportType":"SMTP",
        "config": {
            "host": "mail.server.com", // hostname
            "secureConnection": true, // use SSL
            "port": 578, // port for secure SMTP
            "auth": {
                "user": "foo@bar.com",
                "pass": "12345"
            }
        }
    },
    "templates": {
        "from": "help@onecommons.org",
        "appname": "OneCommons baseapp",
        "appurl":  "http://www.onecommons.org",

        "signup": {
            "subject": "Welcome to {{appname}}!",
            "templatePath": "email/signup.html"
        },
        "resend": {
            "subject": "Complete your registration on {{appname}}",
            "templatePath": "email/resend.html"
        },
        "forgot": {
            "subject": "Reset your password on {{appname}}",
            "templatePath": "email/forgot.html"
        }
    }
}
