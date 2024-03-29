// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    failedLoginsWarning: 3,
    failedLoginAttempts: 5,
    accountLockedTime: 60 * 5, // seconds

    confirmationTokenValidFor: 24, // hours

    // 'facebookAuth' : {
    //     'clientID'      : 'your-app-id',
    //     'clientSecret'  : 'your-app-secret',
    //     'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    // }

    // 'twitterAuth' : {
    //     'consumerKey'       : 'your-consumer-key-here',
    //     'consumerSecret'    : 'your-client-secret-here',
    //     'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    // },

    // 'googleAuth' : {
    //     'clientID'      : 'your-secret-clientID-here',
    //     'clientSecret'  : 'your-client-secret-here',
    //     'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    // }

};