var pagedown = require("pagedown");
var converter = pagedown.getSanitizingConverter();
var _ = require('underscore');

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
    },
    encode: function(project) {
        var gistContent = "";
        gistContent += "# Title \n" + project.notes + "\n";
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
          gistContent += "## " + step.description + "\n\n";
        })
        gistContent += "# Notes\n" + project.notes + "\n";
        console.log(gistContent);
        return gistContent;
    }
};