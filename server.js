//
// # MakeHub server
//
var http = require('http');
var https = require('https');
var path = require('path');

var async = require('async');
var express = require('express');
var util = require('util');
var _ = require('underscore');
var GitHubApi = require('github');
var passport = require('passport')
var GitHubStrategy = require('passport-github').Strategy;

var projectParser = require('./project-parser');

var credentials = require('./credentials');
var GITHUB_CLIENT_ID = credentials.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = credentials.GITHUB_CLIENT_SECRET;

var github = new GitHubApi({
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
    callbackURL: "https://makehub2-c9-asimov4.c9.io/auth/github/callback",
    scope: "gist"
  },
  function(accessToken, refreshToken, profile, done) {
    github.authenticate({
        type: "oauth",
        token: accessToken
    });
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

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/client'));
});


app.get('/', function(req, res){
    
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/save', function(req, res) {
  console.log(req.body.gistName);
  
  github.gists.create(
    {
        description: "Another bowl of pasta",
        public: "true",
        files: {
            "myfile": {
                "content": req.body.gistName
            }
        }
    },function(err, res2) {
        var htmlUrl = res2.html_url;
        res.contentType('json');
        res.send({ response: htmlUrl });
    });
});

app.post('/display_project', function(req, res) {
    console.log(req.body.contentPath);
  
    // get content
    var options = {
      accept: '*/*',
      host: 'gist.github.com',
      port: 443,
      path: req.body.contentPath,
      method: 'GET'
    };
    
    https.request(options, function(res2) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res2.headers));
        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            res.send({ _raw: chunk,
            _json: projectParser.parse(chunk)});
        });
    }).end();
});

app.post('/my_projects', function(req, res) {
  github.gists.getFromUser(
        {
            user: req.user._json.login
        },
        function(err, res2) {
            res.contentType('json');
            var makeHubProjects = [];
            var MAKEHUB_PROJECT_FLAG = "(¯`·._.·[ MakeHub Project ]·._.·´¯)";
            res2.forEach(function(gist,index) {
               if (gist.description == MAKEHUB_PROJECT_FLAG) {
                    var project = {};
                    project.name = _.keys(gist.files)[0];
                    project.contentPath = gist.files[project.name].raw_url.replace("https://gist.github.com","");
                    makeHubProjects.push(project);
               }
            });
            res.send({ projects: makeHubProjects });
        }
    );
});

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0");

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
