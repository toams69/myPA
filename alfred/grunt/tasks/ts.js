module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-ts');

    grunt.config('ts.source', {
        tsconfig: {
            passThrough: true
        }
    }); 

};
