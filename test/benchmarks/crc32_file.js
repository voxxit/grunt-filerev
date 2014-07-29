var Benchmark = require('benchmark'),
    suite = new Benchmark.Suite,
    fs = require('fs'),
    filePath = "./test/benchmarks/1KB.txt",

    // C/C++ CRC32 algorithm
    // https://github.com/Voxer/sse4_crc32
    c_crc32 = require("sse4_crc32"),

    // Pure JS CRC32 algorithm
    // https://github.com/alexgorbatchev/node-crc
    js_crc32 = require("crc"),

    // crypto MD5 (default) algorithm
    // http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm
    crypto = require("crypto");

suite.add('C/C++ CRC32', function() {
  c_crc32.calculate(fs.readFileSync(filePath));
});

suite.add('JS CRC32', function() {
  js_crc32.crc32(fs.readFileSync(filePath));
});

suite.add('crypto MD5', function() {
  crypto.createHash('md5').update(fs.readFileSync(filePath));
});

suite.add('crypto SHA1', function() {
  crypto.createHash('sha1').update(fs.readFileSync(filePath));
});

suite.on('cycle', function(event) {
  console.log(String(event.target));
})

suite.on('complete', function() {
  console.log('Fastest is: ' + this.filter('fastest').pluck('name'));
});

suite.run();
