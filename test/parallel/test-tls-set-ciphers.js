'use strict';
const common = require('../common');

if (!common.opensslCli)
  common.skip('node compiled without OpenSSL CLI.');

if (!common.hasCrypto)
  common.skip('missing crypto');

const assert = require('assert');
const exec = require('child_process').exec;
const tls = require('tls');
const fixtures = require('../common/fixtures');

const options = {
  key: fixtures.readKey('agent2-key.pem'),
  cert: fixtures.readKey('agent2-cert.pem'),
  ciphers: 'AES256-SHA'
};

const reply = 'I AM THE WALRUS'; // something recognizable
let response = '';

process.on('exit', function() {
  assert.notStrictEqual(response.indexOf(reply), -1);
});

const server = tls.createServer(options, common.mustCall(function(conn) {
  conn.end(reply);
}));

server.listen(0, '127.0.0.1', function() {
  let cmd = `"${common.opensslCli}" s_client -cipher ${
    options.ciphers} -connect 127.0.0.1:${this.address().port}`;

  // for the performance and stability issue in s_client on Windows
  if (common.isWindows)
    cmd += ' -no_rand_screen';

  exec(cmd, function(err, stdout, stderr) {
    if (err) throw err;
    response = stdout;
    server.close();
  });
});
