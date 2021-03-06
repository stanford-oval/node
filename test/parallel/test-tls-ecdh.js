'use strict';
const common = require('../common');
const fixtures = require('../common/fixtures');

if (!common.hasCrypto)
  common.skip('missing crypto');

if (!common.opensslCli)
  common.skip('missing openssl-cli');

const assert = require('assert');
const tls = require('tls');

const exec = require('child_process').exec;

const options = {
  key: fixtures.readKey('agent2-key.pem'),
  cert: fixtures.readKey('agent2-cert.pem'),
  ciphers: '-ALL:ECDHE-RSA-AES128-SHA256',
  ecdhCurve: 'prime256v1'
};

const reply = 'I AM THE WALRUS'; // something recognizable

const server = tls.createServer(options, common.mustCall(function(conn) {
  conn.end(reply);
}));

server.listen(0, '127.0.0.1', common.mustCall(function() {
  let cmd = `"${common.opensslCli}" s_client -cipher ${
    options.ciphers} -connect 127.0.0.1:${this.address().port}`;

  // for the performance and stability issue in s_client on Windows
  if (common.isWindows)
    cmd += ' -no_rand_screen';

  exec(cmd, common.mustCall(function(err, stdout, stderr) {
    if (err) throw err;
    assert(stdout.includes(reply));
    server.close();
  }));
}));
