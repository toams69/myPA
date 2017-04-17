module.exports = function(grunt) {
    var path = require('path');
    grunt.registerMultiTask('staticData', function() {
        var params = this.data;
        var template = grunt.file.read(params.templateFile);
        var templateProcessed = grunt.template.process(template, {
            data: params.data
        });
        grunt.log.writeln("staticData template generated: ", templateProcessed);
        grunt.file.write(params.target, templateProcessed);
        grunt.log.writeln(params.target, " (re)created");
    });

    grunt.config('staticData.buildInfo', {
        target: path.resolve('target/build/info.json'),
        templateFile: path.resolve('grunt/config/buildInfo.tmpl.json'),
        data: {
             "version": grunt.option('buildVersion') || 'development build',
             "changeset": grunt.option('mercurialChangeset')
        }
    });
};
