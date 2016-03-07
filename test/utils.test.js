import { expect } from 'chai';
import { finalizeOperands } from '../src/utils';

describe("Utils", function() {
  describe("finalizeOperands", function() {

    it("realises functions", function() {
      expect(
        finalizeOperands(
          () => 'foo', () => 'bar', 'baz',
            { a: () => 'quux' }
        )()
      ).to.eql(['foo', 'bar', 'baz', { a: 'quux' }])

    })

  })

})
