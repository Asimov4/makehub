var pagedown = require("pagedown");
var converter = pagedown.getSanitizingConverter();
var _ = require('underscore');

module.exports = {
    parse: function(gist, callback) {
        //return projectContent.split('\n');
        var project =  {
          'id': gist.id,
          'user': gist.user.login,
          'description': gist.description,
          'urls': [],
          'raw': gist.files['makehub'].content
        };
        if (gist.files['makehub'].content) {
            var projectGist = gist.files['makehub'].content;
            var matches = projectGist.match(/media: (.*)/g);
            if (matches) {
            var urls = matches.map(function (match, index) {
                projectGist = projectGist.replace(match, "{{" + index + "}}");
                    return match.replace("media: ", "");
                });
                project['urls'] = urls;
            }
            project['content'] = converter.makeHtml(projectGist);
        }
        return project;
    },
    encode: function(project) {
        var gistContent = "";
        gistContent += "# Title \n" + project.title + "\n";
        gistContent += "# Picture \n" + project.picture + "\n";
        gistContent += "# Objective\n" + project.objective + "\n";
        gistContent += "# Duration\n" + project.duration + "\n";
        gistContent += "# Age Group\n" + project.ageGroup + "\n";
        gistContent += "# Materials\n";
        _.each(project.materials, function(material) {
          gistContent += "## " + material.item + "\n";
          gistContent += "* description:" + material.description + "\n";
          gistContent += "* quantity:" + material.quantity + "\n";
          gistContent += "* price:" + material.price + "\n";
          gistContent += "* link:" + material.link + "\n\n";
        });
        gistContent += "# Steps\n";
        _.each(project.steps, function(step) {
          gistContent += "## " + step.description + "\n";
          gistContent += "media: " + step.media + "\n\n";
        })
        gistContent += "# Notes\n" + project.notes + "\n";
        console.log(gistContent);
        return gistContent;
    }
};