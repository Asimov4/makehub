// # MakeHub server
//

// Core imports
var http = require('http');
var https = require('https');
var path = require('path');

// Third party modules import
var async = require('async');
var express = require('express');
var util = require('util');
var _ = require('underscore');

// MakeHub imports
var github = require('./auth/github');
var projectParser = require('./project-parser');
var MAKEHUB_PROJECT_FLAG = "(¯`·._.·[ MakeHub Project ]·._.·´¯)";

console.log('Running application with GITHUB_CLIENT_ID = ' + github.GITHUB_CLIENT_ID);
console.log('Running application with GITHUB_CLIENT_SECRET = ' + github.GITHUB_CLIENT_SECRET);
console.log('Running application on ' + github.HOSTNAME);

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
  app.use(github.passport.initialize());
  app.use(github.passport.session());

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
  github.passport.authenticate('github'),
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
  github.passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/save', function(req, res) {
  console.log(req.body.gistName);

  var file = {};
  file[req.body.newProject.title] = {"content": req.body.newProject.body};

  github.connexion.gists.create(
    {
        description: MAKEHUB_PROJECT_FLAG,
        public: "true",
        files: file
    },function(err, res2) {
        var htmlUrl = res2.html_url;
        res.contentType('json');
        res.send({ response: htmlUrl });
    });
});

app.post('/modify', function(req, res) {
  console.log(req.body.selectedProject);

  var file = {};
  file[req.body.selectedProject.title] = {"content": req.body.rawProject};

  github.connexion.gists.edit(
    {
        id: req.body.selectedProject.id,
        files: file
    },function(err, res2) {
        res.contentType('json');
        res.send({ response: res2 });
    });
});

app.post('/display_project', function(req, res) {
    console.log(req.body.project.contentPath);

    // get content
    var options = {
      accept: '*/*',
      host: 'gist.github.com',
      port: 443,
      path: req.body.project.contentPath,
      method: 'GET'
    };

    https.request(options, function(res2) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res2.headers));
        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            res.send({
                title: req.body.project.title,
                id: req.body.project.id,
                _raw: chunk,
                _json: projectParser.parse(chunk)});
        });
    }).end();
});

app.post('/my_projects', function(req, res) {
  github.connexion.gists.getFromUser(
        {
            user: req.user._json.login
        },
        function(err, res2) {
            res.contentType('json');
            var makeHubProjects = [];
            res2.forEach(function(gist,index) {
               if (gist.description == MAKEHUB_PROJECT_FLAG) {
                    var project = {};
                    project.title = _.keys(gist.files)[0];
                    project.id = gist.id;
                    project.contentPath = gist.files[project.title].raw_url.replace("https://gist.github.com","");
                    makeHubProjects.push(project);
               }
            });
            res.send({ projects: makeHubProjects });
        }
    );
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000, process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "0.0.0.0");

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
