'use strict';
require('../common');
const fixtures = require('../common/fixtures');
const assert = require('assert');
const execFile = require('child_process').execFile;
const depmod = fixtures.path('deprecated.js');
const node = process.execPath;

const depUserlandFunction =
  fixtures.path('deprecated-userland-function.js');

const depUserlandClass =
  fixtures.path('deprecated-userland-class.js');

const depUserlandSubClass =
  fixtures.path('deprecated-userland-subclass.js');

const normal = [depmod];
const noDep = ['--no-deprecation', depmod];
const traceDep = ['--trace-deprecation', depmod];

execFile(node, normal, function(er, stdout, stderr) {
  console.error('normal: show deprecation warning');
  assert.strictEqual(er, null);
  assert.strictEqual(stdout, '');
  assert(/util\.debug is deprecated/.test(stderr));
  console.log('normal ok');
});

execFile(node, noDep, function(er, stdout, stderr) {
  console.error('--no-deprecation: silence deprecations');
  assert.strictEqual(er, null);
  assert.strictEqual(stdout, '');
  assert.strictEqual(stderr, 'DEBUG: This is deprecated\n');
  console.log('silent ok');
});

execFile(node, traceDep, function(er, stdout, stderr) {
  console.error('--trace-deprecation: show stack');
  assert.strictEqual(er, null);
  assert.strictEqual(stdout, '');
  const stack = stderr.trim().split('\n');
  // just check the top and bottom.
  assert(/util.debug is deprecated. Use console.error instead./.test(stack[1]));
  assert(/DEBUG: This is deprecated/.test(stack[0]));
  console.log('trace ok');
});

execFile(node, [depUserlandFunction], function(er, stdout, stderr) {
  console.error('normal: testing deprecated userland function');
  assert.strictEqual(er, null);
  assert.strictEqual(stdout, '');
  assert(/deprecatedFunction is deprecated/.test(stderr));
  console.error('normal: ok');
});

execFile(node, [depUserlandClass], function(er, stdout, stderr) {
  assert.strictEqual(er, null);
  assert.strictEqual(stdout, '');
  assert(/deprecatedClass is deprecated/.test(stderr));
});

execFile(node, [depUserlandSubClass], function(er, stdout, stderr) {
  assert.strictEqual(er, null);
  assert.strictEqual(stdout, '');
  assert(/deprecatedClass is deprecated/.test(stderr));
});
