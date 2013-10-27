var pagedown = require("pagedown");
var converter = pagedown.getSanitizingConverter();

module.exports = {
    parse: function(gist) {
        //return projectContent.split('\n');
        var project =  {
          'id': gist.id,
          'user': gist.user.login,
          'description': gist.description,
          'raw': gist.files['makehub'].content
        };
        if (gist.files['makehub'].content) {
          project['content'] = converter.makeHtml(gist.files['makehub'].content);
        }
        return project;
    }
};