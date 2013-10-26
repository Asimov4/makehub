// 
//Github api authentication handler
//

// Imports
var GitHubApi = require('github');
var credentials = require('./credentials');

// Exported variables
var GITHUB_CLIENT_ID = credentials.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = credentials.GITHUB_CLIENT_SECRET;
var HOST_NAME = 'https://makehub3-c9-devnook.c9.io';

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
    HOST_NAME = val.split('=')[1];
  }
});

// Set up a Github connexion api object
var github_connexion = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    timeout: 5000
});

module.exports.GITHUB_CLIENT_ID = GITHUB_CLIENT_ID
module.exports.GITHUB_CLIENT_SECRET = GITHUB_CLIENT_SECRET
module.exports.HOST_NAME = HOST_NAME
module.exports.conn = github_connexion
