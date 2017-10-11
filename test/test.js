var should = require('should');

describe('number', function() {
    it ('5 should be 5', function() {
        (5).should.be.exactly(5).and.be.a.Number();
    });
});


var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});