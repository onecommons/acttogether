// config/email.js

module.exports = {
    // nodemailer config vars
    // see http://www.nodemailer.com/docs/transports
    "mailer": {
        "transport":"SMTP",
        "config": {
            service: "SendGrid",
            auth: {
                user: "username",
                pass: "password"
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
