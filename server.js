// # MakeHub server
//
// New Relic Metrics import
require('newrelic');

// Core imports
var http = require('http');
var https = require('https');
var path = require('path');

// Third party modules import
var async = require('async');
var express = require('express');
var I18n = require('i18n-2');
var util = require('util');
var _ = require('underscore');
var restler = require('restler')

// MakeHub imports
var github = require('./auth/github');
var projectParser = require('./project-parser');
var MAKEHUB_PROJECT_FLAG = "(¯`·._.·[ MakeHub Project ]·._.·´¯)";
var pagedown = require("pagedown");
var converter = pagedown.getSanitizingConverter();

console.log('Running application with GITHUB_CLIENT_ID = ' + github.GITHUB_CLIENT_ID);
console.log('Running application with GITHUB_CLIENT_SECRET = ' + github.GITHUB_CLIENT_SECRET);
console.log('Running application on ' + github.HOSTNAME);

//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();

// configure Express
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
        secret: 'keyboard cat'
    }));
    I18n.expressBind(app, {
        locales:['en','cn'],
        cookieName: 'locale'
    });

    // This is how you'd set a locale from req.cookies.
    // Don't forget to set the cookie either on the client or in your Express app.
    app.use(function(req, res, next) {
        //this changes it to chinese: document.cookie = "locale=cn";
        req.i18n.setLocaleFromCookie(req);
        next();
    });
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(github.passport.initialize());
    app.use(github.passport.session());

    app.use(app.router);
    app.use(express.static(__dirname + '/client'));
});


app.get('/', function (req, res) {
    res.render('index', {
        user: req.user,
        hostname: github.HOSTNAME,
    });
});

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
    github.passport.authenticate('github'),
    function (req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback',
    github.passport.authenticate('github', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.redirect('/#/create');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/cn', function (req, res) {
    res.cookie('locale', '"cn"', { maxAge: 90000, path: '/' });
    res.redirect('/');
});
app.get('/en', function (req, res) {
    res.clearCookie('locale');
    res.redirect('/');
});

app.post('/create', function (req, res) {
    if (!req.isAuthenticated()) {
        res.send({
            'error': 'Login required'
        });
        return;
    }
    github.conn(req).gists.create({
        description: req.body.project.title,
        public: "true",
        files: {
            'makehub': {
                "content": projectParser.encode(req.body.project)
            },
            'makehub.json': {
                "content": JSON.stringify(req.body.project)
            }
        }
    }, function (err, gist) {
        if (err) {
            res.send({
                'error': JSON.parse(err.message).message
            })
        } else if (!gist.files['makehub']) {
            res.send({
                'error': 'This is not a makehub project.'
            })
        } else {
            var project = projectParser.parse(gist);
            res.send(project);
        }
    });
});

app.post('/project/:projectId', function (req, res) {
    if (!req.isAuthenticated()) {
        res.send({
            'error': 'Login required'
        });
        return;
    }
    var options = {
        id: req.params.projectId,
        description: req.body.project.title,
        files: {
            'makehub': {
                "content": projectParser.encode(req.body.project)
            },
            'makehub.json': {
                "content": JSON.stringify(req.body.project)
            }
        }
    };
    github.conn(req).gists.edit(
        options, function (err, gist) {
            if (err) {
                res.send({
                    'error': JSON.parse(err.message).message
                })
            } else if (!gist.files['makehub']) {
                res.send({
                    'error': 'This is not a makehub project.'
                })
            } else {
                var project = projectParser.parse(gist);
                res.send(project);
            }
        });
});

app.get('/project/:projectId', function (req, res) {
    console.log([req.params.userId, req.params.projectId, 'raw'].join('/'));
    var currentlyLoggedInUser = req.user ? req.user._json.login : null;
    // https://api.github.com/gists/4224228
    github.conn(req).gists.get({
            id: req.params.projectId
        },
        function (err, gist) {
            //console.log(err)
            //console.log(gist)
            if (err) {
                res.send({
                    'error': JSON.parse(err.message).message
                })
            } else if (!gist.files['makehub']) {
                res.send({
                    'error': 'This is not a makehub project.'
                })
            } else {

                var project = projectParser.parse(gist);
                project.ownedByMe = currentlyLoggedInUser == gist.owner.login;

                var opts = {
                    urls: project.urls,
                    maxWidth: 450
                };

                project['urls'].forEach(function(media, index) {
                    var replaceValue = "<img src='" + media.replace("http:","https:") + "'>";
                    project['content'] = project['content'].replace("{{" + index + "}}", replaceValue);
                });
                res.send(project);

            }
        }
    );
});

app.post('/project/fork/:projectId', function (req, res) {
    if (!req.isAuthenticated()) {
        res.send({
            'error': 'Login required'
        });
        return;
    }

    console.log("FORKING project " + req.params.projectId);
    github.conn(req).gists.fork({
            id: req.params.projectId
        },
        function (err, gist) {
            console.log(err)
            console.log(gist)
            if (err) {
                res.send({
                    'error': JSON.parse(err.message).message
                })
            } else {
                res.send({
                    id: gist.id
                });
            }
        }
    );
});

app.post('/project/delete/:projectId', function (req, res) {
    if (!req.isAuthenticated()) {
        res.send({
            'error': 'Login required'
        });
        return;
    }

    console.log("DELETING project " + req.params.projectId);
    github.conn(req).gists.delete({
            id: req.params.projectId
        },
        function (err, gist) {
            if (err) {
                console.log(err)
                res.send({
                    'error': JSON.parse(err.message).message
                })
            } else {
                res.send({
                    id: gist.id
                });
            }
        }
    );
});

app.post('/my_projects', function (req, res) {
    github.conn(req).gists.getFromUser({
            user: req.user._json.login
        },
        function (err, res2) {
            res.contentType('json');
            var makeHubProjects = [];
            res2.forEach(function (gist, index) {
                if (gist.files['makehub']) {
                    console.log(gist)
                    var project = projectParser.parse(gist);
                    makeHubProjects.push(project);
                }
            });
            res.send({
                projects: makeHubProjects
            });
        }
    );
});

app.post('/upload_picture', function (req, res) {
    var file = req.files.file
    restler.post("http://deviantsart.com", {
        multipart: true,
        data: {
            "filename": restler.file(file.path, file.name,
                                     file.size, null, "image/jpg")
        }
    }).on("complete", function(data) {
        res.send(data);
    });
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000, process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "0.0.0.0");

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}
