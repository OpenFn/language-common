import { expect } from 'chai';

import { execute } from '../src/index'

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


