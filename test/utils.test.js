import { expect } from 'chai';
import Utils from '../src/utils';

describe("Utils", function() {
  describe("finalizeOperands", function() {

    it("realises functions", function() {
      expect(
        Utils.finalizeOperands(
          () => 'foo', () => 'bar', 'baz',
            { a: () => 'quux' }
        )()
      ).to.eql(['foo', 'bar', 'baz', { a: 'quux' }])

    })

  })

}
        )
