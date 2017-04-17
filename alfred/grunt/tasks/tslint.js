module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-tslint');
    grunt.config('tslint.source', {
      options: {
        configuration: "grunt/config/tslint.json"
      },
      files: {
        src: ["src/**/*.ts", "!src/**/**.d.ts"]
      }
    });

};
