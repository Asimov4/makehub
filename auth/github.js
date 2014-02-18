//
//Github api authentication handler
//

// Imports
var GitHubApi = require('github');
var passport = require('passport')
var GitHubStrategy = require('passport-github').Strategy;


// Exported variables
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
var HOSTNAME = process.env.MAKEHUB_HOSTNAME;


// Update github api connexion parameters
// from command line arguments
process.argv.forEach(function(val, index, array) {
  if (val.split('=')[0] == '--github-client-id') {
    GITHUB_CLIENT_ID = val.split('=')[1];
  }
  if (val.split('=')[0] == '--github-client-secret') {
    GITHUB_CLIENT_SECRET = val.split('=')[1];
  }
  if (val.split('=')[0] == '--host') {
    HOSTNAME = val.split('=')[1];
  }
});


// Set up a Github connexion api object
var github_connexion = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    timeout: 5000
});


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: HOSTNAME + "/auth/github/callback",
    scope: "gist"
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




// Expose module public vars
module.exports.GITHUB_CLIENT_ID = GITHUB_CLIENT_ID
module.exports.GITHUB_CLIENT_SECRET = GITHUB_CLIENT_SECRET
module.exports.HOSTNAME = HOSTNAME

// Expose module public objects
module.exports.conn = function(req) {
    var token = "";
    if (req.isAuthenticated()) {
        token = req.session.passport.user.accessToken;
        github_connexion.authenticate({
            type: "oauth",
            token: token
        });
    }

    return github_connexion;
}
module.exports.passport = passport
