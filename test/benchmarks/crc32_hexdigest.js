var Benchmark = require('benchmark'),
    suite = new Benchmark.Suite,
    testBuffer = new Buffer("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi mollis cursus metus vel tristique. Proin congue massa massa, a malesuada dolor ullamcorper a. Nulla eget leo vel orci venenatis placerat. Donec semper condimentum justo, vel sollicitudin dolor consequat id. Nunc sed aliquet felis, eget congue nisi. Mauris eu justo suscipit, elementum turpis ut, molestie tellus. Mauris ornare rutrum fringilla. Nulla dignissim luctus pretium. Nullam nec eros hendrerit sapien pellentesque sollicitudin. Integer eget ligula dui. Mauris nec cursus nibh. Nunc interdum elementum leo, eu sagittis eros sodales nec. Duis dictum nulla sed tincidunt malesuada. Quisque in vulputate sapien. Sed sit amet tellus a est porta rhoncus sed eu metus. Mauris non pulvinar nisl, volutpat luctus enim. Suspendisse est nisi, sagittis at risus quis, ultricies rhoncus sem. Donec ullamcorper purus eget sapien facilisis, eu eleifend felis viverra. Suspendisse elit neque, semper aliquet neque sed, egestas tempus leo. Duis condimentum turpis duis."),

    // C/C++ CRC32 algorithm
    // https://github.com/Voxer/sse4_crc32
    c_crc32 = require("sse4_crc32"),

    // Pure JS CRC32 algorithm
    // https://github.com/alexgorbatchev/node-crc
    js_crc32 = require("crc"),

    // crypto MD5 (default) algorithm
    // http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm
    crypto = require("crypto");

suite.add('C/C++ CRC32 (hexdigest)', function() {
  var result, number;

  number = c_crc32.calculate(testBuffer);
  result = number.toString(16);

  while (result.length % 2) {
    result = "0" + result;
  }
});

suite.add('JS CRC32 (hexdigest)', function() {
  var v = new crc.CRC32();
  v.update(testBuffer);
  v.hexdigest();
});

suite.add('crypto MD5', function() {
  crypto.createHash('md5').update(testBuffer).digest('hex');
});

suite.add('crypto SHA1', function() {
  crypto.createHash('sha1').update(testBuffer).digest('hex');
});

suite.on('cycle', function(event) {
  console.log(String(event.target));
})

suite.on('complete', function() {
  console.log('Fastest is: ' + this.filter('fastest').pluck('name'));
});

suite.run();
