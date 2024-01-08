const assert = require('assert');
const {escapeHTML} = require("../src/utils");
describe('Unit Tests', function () {
  it('escapeHTML should work as expected', function () {
    assert.strictEqual(escapeHTML('<hello>()\'"'), '&lt;hello&gt;&lpar;&rpar;&#39;&quot;');
  });
});
