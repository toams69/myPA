module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');

  const path = require('path');
  const dest = './target/build/';

  grunt.config('copy', {
    npm: {
        files: [
            {src: 'package.json', dest: path.resolve(dest, 'package.json')},
            {src: '.npmrc', dest: path.resolve(dest, '.npmrc')}
        ]
    },
    config: {
        files: [
            {cwd: 'src/config', src: '**', dest: path.resolve(dest, 'config'), expand: true},
            {cwd: 'src/api/swagger', src: '**', dest: path.resolve(dest, 'api/swagger'), expand: true}
        ]
    },
    webapp: {
        files: [
            {cwd: 'src/js', src: '**', dest: path.resolve(dest, 'webapp'), expand: true}
        ]
    }
  });
};
