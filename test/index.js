import { expect } from 'chai';
import testData from './testData';

import {
  execute, each, join, source, sourceValue, map, combine
} from '../src';

describe("execute", () => {

  it("executes each operation in sequence", (done) => {
    let state = {}
    let operations = [
      (state) => { return {counter: 1} },
      (state) => { return {counter: 2} },
      (state) => { return {counter: 3} }
    ]

    execute(...operations)(state)
    .then((finalState) => {
      expect(finalState).to.eql({ counter: 3 })
    })
    .then(done).catch(done)


  })

  it("returns a function that returns state", () => {
    let state = {}

    let finalState = execute()(state)

    expect(finalState).to.eql(state)
  
  })
})

describe("sourceValue", () => {
  it("references a given path", () => {
    let value = sourceValue("$.store.bicycle.color", testData);
    expect(value).to.eql("red");
  })
})

describe("source", () => {
  it("references a given path", () => {
    let value = source("$.store.bicycle.color")(testData);
    expect(value).to.eql([ "red" ]);
  })
})

describe("each", () => {

  let state
  let operation = ({data, references}) => { return {
    data, references: [data, ...references]
  } }

  beforeEach(function() {
    state = { data: testData, references: [] }
  })

  it("maps the operation results in the references", () => {
    let results = each( "$.data.store.book[*]", operation )(state)
    expect(results.references.reverse()).to.eql(testData.store.book)
  })

  it("maps the operation results in the data", () => {
    let results = each( testData.store.book, operation )(state)
    expect(results.references.reverse()).to.eql(testData.store.book)
  })

  it("calls the data sourcing function", () => {
    let sourcingFunction = (state) => {
      return state.data.store.book
    }

    let results = each( sourcingFunction , operation )(state)
    expect(results.references.reverse()).to.eql(testData.store.book)
  })

  it("resolves promise operations", (done) => {
    let sourcingFunction = (state) => {
      return state.data.store.book
    }

    operation = ({data, references}) => {
      return Promise.resolve({
        data, references: [data, ...references]
      })
    }

    each( sourcingFunction , operation )(state).then((state) => {
      expect(state.references.reverse()).to.eql(testData.store.book)
    }).then(done).catch(done)
  })

})

describe("map", () => {

  xit("[DEPRECATED] can produce a one to one from an array", () => {
    let items = [];

    let state = { data: testData, references: [] }
    let results = map('$.data.store.book[*]', 
                      function(state) {
                        console.log("hello");
                        // console.log(JSON.stringify( state ));
                        // items.push( { title: sourceValue("$.data.title", state) } )
                        return { references: [1, ...state.references], ...state }
                      }, state)

                      expect(results.references).to.eql([
                        { "title": "Sayings of the Century" },
                        { "title": "Sword of Honour" },
                        { "title": "Moby Dick" },
                        { "title": "The Lord of the Rings" }
                      ])

  });

})

describe("combine", () => {

  let state = { }
  let operations = [
    (state) => { return { hello: 1 } },
      (state) => { return { hello: state.hello + 5 } }
  ]


  it("accepts serveral operations, and reduces them with the state", () => {
    let result = combine.apply(null,operations)(state)
    expect(result).to.eql({ hello: 6 })
  })

})

describe("join", () => {
  it("merges in a previously defined field", () => {
    let result = join(
      "$.store.book[*]",
      "$.store.bicycle.color",
      "color"
    )(testData)

    expect(result[0]).to.eql( {
      "author": "Nigel Rees",
      "category": "reference",
      "color": "red",
      "price": 8.95,
      "title": "Sayings of the Century"
    })
  })
})
