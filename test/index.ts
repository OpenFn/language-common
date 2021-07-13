import { expect } from 'chai';
import testData from './testData.json';

import {
  arrayToString,
  combine,
  dataPath,
  dataValue,
  each,
  execute,
  expandReferences,
  field,
  fields,
  index,
  join,
  lastReferenceValue,
  // map,
  merge,
  referencePath,
  source,
  sourceValue,
  splitKeys,
  toArray,
} from '../src';

describe('execute', () => {
  it('executes each operation in sequence', async () => {
    let state = {};
    let operations = [
      state => {
        return { counter: 1 };
      },
      state => {
        return { counter: 2 };
      },
      state => {
        return { counter: 3 };
      },
    ];

    // @ts-ignore
    const result = await execute(...operations)(state);

    expect(result).to.eql({ counter: 3 });
  });

  it('returns a function that returns state', async function () {
    let state = {};

    // @ts-ignore
    let finalState = await execute()(state);

    expect(finalState).to.eql(state);
  });
});

describe('sourceValue', () => {
  it('references a given path', () => {
    // @ts-ignore
    let value = sourceValue('$.store.bicycle.color')(testData);
    expect(value).to.eql('red');
  });
});

describe('source', () => {
  it('references a given path', () => {
    // @ts-ignore
    let value = source('$.store.bicycle.color')(testData);
    expect(value).to.eql(['red']);
  });
});

describe('map', () => {
  xit('[DEPRECATED] can produce a one to one from an array', () => {
    let items = [];

    let state = { data: testData, references: [] };

    // @ts-ignore
    let results = map(
      '$.data.store.book[*]',
      function (state) {
        console.log('hello');
        // console.log(JSON.stringify( state ));
        // items.push( { title: sourceValue("$.data.title", state) } )
        return { references: [1, ...state.references], ...state };
      },
      state
    );

    expect(results.references).to.eql([
      { title: 'Sayings of the Century' },
      { title: 'Sword of Honour' },
      { title: 'Moby Dick' },
      { title: 'The Lord of the Rings' },
    ]);
  });
});

describe('combine', () => {
  let state = {};
  let operations = [
    state => {
      return { hello: 1 };
    },
    state => {
      return { hello: state.hello + 5 };
    },
  ];

  it('accepts serveral operations, and reduces them with the state', () => {
    let result = combine.apply(null, operations)(state);
    expect(result).to.eql({ hello: 6 });
  });
});

describe('join', () => {
  it('merges in a previously defined field', () => {
    let result = join(
      '$.store.book[*]',
      '$.store.bicycle.color',
      'color'
      // @ts-ignore
    )(testData);

    expect(result[0]).to.eql({
      author: 'Nigel Rees',
      category: 'reference',
      color: 'red',
      price: 8.95,
      title: 'Sayings of the Century',
    });
  });
});

describe('expandReferences', () => {
  it('resolves function values on objects', () => {
    let result = expandReferences({
      a: s => s,
      // function nested inside an object inside and array
      b: [2, { c: s => s + 2 }, 3],
      c: 4,
      // function that returns a function
      d: s => s => s + 4,
      // @ts-ignore
    })(1);

    expect(result).to.eql({
      a: 1,
      b: [2, { c: 3 }, 3],
      c: 4,
      d: 5,
    });
  });

  it("doesn't affect empty objects", () => {
		// @ts-ignore
    let result = expandReferences({})(1);

    expect(result).to.eql({});
		// @ts-ignore
    result = expandReferences([])(1);
    expect(result).to.eql([]);
		// @ts-ignore
    result = expandReferences(null)(1);
    expect(result).to.eql(null);
    // @ts-ignore
    result = expandReferences(undefined)(1);
    expect(result).to.eql(undefined);
  });

  it('resolves function values on arrays', () => {
    // @ts-ignore
    let result = expandReferences([2, { c: s => s + 2 }, 3])(1);

    expect(result).to.eql([2, { c: 3 }, 3]);
  });
});

describe('field', () => {
  it('returns a pair', () => {
    expect(field('a', 1)).to.eql(['a', 1]);
  });
});

describe('fields', () => {
  it('returns an object', () => {
    // @ts-ignore
    expect(fields(['a', 1], ['b', 2])).to.eql({ a: 1, b: 2 });
  });
});

describe('merge', () => {
  it('merges in a set of fields from data, for an array of sources', () => {
    let result = merge(
      '$.store.book[*]',
      fields(
        field('color', sourceValue('$.store.bicycle.color')),
        field('price', sourceValue('$.store.bicycle.price'))
      )
      // @ts-ignore
    )(testData);

    expect(result[0].color).to.eql('red');
    expect(result[1].color).to.eql('red');
    expect(result[2].color).to.eql('red');
    expect(result[3].color).to.eql('red');

    expect(result[0].price).to.eql(19.95);
    expect(result[1].price).to.eql(19.95);
    expect(result[2].price).to.eql(19.95);
    expect(result[3].price).to.eql(19.95);
  });
});

describe('Path Helpers', () => {
  describe('dataPath', () => {
    it('prepends source data paths with $.data', () => {
      expect(dataPath('data.hello')).to.eql('$.data.data.hello');
      expect(dataPath('$.data.hello')).to.eql('$.data.data.hello');
      // TODO: should we expect it to handle arrays like this...
      // expect(dataPath("[0].foo")).to.eql("$.data[0].foo")
      // Or like this...
      expect(dataPath('[0].foo')).to.eql('$.data.[0].foo');
    });
  });
  describe('dataValue', () => {
    it('references a given path inside $.data', () => {
      // @ts-ignore
      let value = dataValue('store.bicycle.color')({ data: testData });
      expect(value).to.eql('red');
    });
  });
  describe('referencePath', () => {
    it('prepends a paths with $.references', () => {
      expect(referencePath('[0]')).to.eql('$.references[0]');
    });
  });
  describe('lastReferenceValue', () => {
    it('returns the last reference in `state.references`', () => {
      expect(
        // @ts-ignore
        lastReferenceValue('foo')({
          references: [{ foo: 'bar' }, { baz: 'foo' }],
        })
      ).to.eql('bar');
    });
  });
});

describe('index', function () {
  it('returns the current index value of an item in `each`', () => {
    let operation = state => {
      return { ...state, references: [...state.references, index()(state)] };
    };

    let results = each(
      '$.data.store.book[*]',
      operation
      // @ts-ignore
    )({
      references: [],
      data: testData,
    });

    // @ts-ignore
    expect(results.references).to.eql([0, 1, 2, 3]);
  });
});

describe('arrayToString', function () {
  it('returns a comma separated string from an array', function () {
    expect(arrayToString([1, 2, 3], ', ')).to.eql('1, 2, 3');
  });

  it('does not require a separator', function () {
    // @ts-ignore
    expect(arrayToString([1, 2, 3])).to.eql('123');
  });
});

describe('toArray', function () {
  it('leaves arrays untouched', function () {
    expect(toArray([1, 2, 3])).to.eql([1, 2, 3]);
  });

  it('wraps objects in an array', function () {
    expect(toArray({ a: 1 })).to.eql([{ a: 1 }]);
  });

  it('wraps strings in an array', function () {
    expect(toArray('a')).to.eql(['a']);
  });
});

describe('splitKeys', function () {
  it('returns an array of 2 objects, split on keys', function () {
    const initialObject = { a: 1, b: 2, c: 3 };
    const desired = [{ a: 1, c: 3 }, { b: 2 }];
    expect(splitKeys(initialObject, ['b'])).to.eql(desired);
  });

  it('handles empty objects and non-existent keys', function () {
    const initialObject = {};
    const desired = [{}, {}];
    expect(splitKeys(initialObject, ['b'])).to.eql(desired);
  });
});
