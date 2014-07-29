'use strict';

// allow use of (much faster) c/c++ crc32
// algorithm available through npm:
//
//   `npm install sse4_crc32`
//
try {
  var crc = require('sse4_crc32');

  // return the hex-encoded hash
  // value of the CRC32 object in the
  // same fashion as the crypto std lib.
  crc.CRC32.prototype.hexdigest = function () {
    var result = this.crc32.toString(16);

    while (result.length % 2) {
      result = "0" + result;
    }

    return result;
  };
} catch (e) {}

var crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    chalk = require('chalk'),
    eachAsync = require('each-async');

module.exports = function (grunt) {
  grunt.registerMultiTask('filerev', 'File revisioning based on content hashing', function () {
    var options = this.options({
      encoding: 'utf8',
      algorithm: 'md5',
      length: 8
    });
    var target = this.target;
    var filerev = grunt.filerev || {summary: {}};

    eachAsync(this.files, function (el, i, next) {
      var move = true;

      // If dest is furnished it should indicate a directory
      if (el.dest) {
        // When globbing is used, el.dest contains basename, we remove it
        if(el.orig.expand) {
          el.dest = path.dirname(el.dest);
        }

        try {
          var stat = fs.lstatSync(el.dest);
          if (stat && !stat.isDirectory()) {
            grunt.fail.fatal('Destination ' + el.dest  + ' for target ' + target + ' is not a directory');
          }
        } catch (err) {
          grunt.log.writeln('Destination dir ' + el.dest + ' does not exists for target ' + target + ': creating');
          grunt.file.mkdir(el.dest);
        }
        // We need to copy file as we now have a dest different from the src
        move = false;
      }

      el.src.forEach(function (file) {
        if (grunt.file.isDir(file)) {
          return;
        }
        var dirname, hash;

        if (options.algorithm === "crc32" &&
           (typeof crc !== "undefined" && crc !== null)) {
          hash = new crc.CRC32().update(grunt.file.read(file)).hexdigest();

        } else {
          hash = crypto.createHash(options.algorithm).update(grunt.file.read(file), options.encoding).digest('hex');
        }

        var suffix = hash.slice(0, options.length);
        var ext = path.extname(file);
        var newName = [path.basename(file, ext), suffix, ext.slice(1)].join('.');
        var resultPath;

        if (move) {
          dirname = path.dirname(file);
          resultPath = path.resolve(dirname, newName);
          fs.renameSync(file, resultPath);
        } else {
          dirname = el.dest;
          resultPath = path.resolve(dirname, newName);
          grunt.file.copy(file, resultPath);
        }

        filerev.summary[path.normalize(file)] = path.join(dirname, newName);
        grunt.log.writeln(chalk.green('✔ ') + file + chalk.gray(' changed to ') + newName);
      });
      next();
    }, this.async());

    grunt.filerev = filerev;
  });
};
