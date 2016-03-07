import { expect } from 'chai';
import { execute, fields, field } from '../src';
import { audit } from '../src/audit'
import { finalize } from '../src/utils';

describe("audit", () => {

  it('works with finalize', function() {

    function dummyOperation(fields) {
      return state => {
        return {};
      }
    }

    let operation = finalize( audit(dummyOperation) )

    return execute(
      operation(
        fields(field("foo", () => 'bar'))
      )
    )({ a: 2 }).then( (state) => {

      expect(state).to.eql({ history: [

        {
          type: 'operation',
          name: "dummyOperation",
          status: 0, 
          operands: [{ foo: 'bar' }]
        }

      ] })

    })
    
  })

  it('catches errors and attaches them to history', function() {

    function errorOperation(arg1, arg2) {
      return state => {
        throw new Error('An error has occured.')
      }
    }

    let operation = audit(errorOperation)

    return execute(
      operation("arg1", "arg2")
    )({}).then( (state) => {

      expect(state).to.eql({ history: [

        {
          type: 'operation',
          name: "errorOperation",
          status: 1, 
          operands: ["arg1", "arg2"],
          error: "Error: An error has occured."
        }

      ] })

    })

  })

  it('wraps existing functions with meta data', function() {

    function dummyOperation(a,b) {
      return state => {
        return { a, b };
      }
    }

    let operation = audit(dummyOperation)

    return execute(
      operation("arg1", "arg2")
    )({ a: 2 }).then( (state) => {

      expect(state).to.eql({ a: "arg1", b: "arg2", history: [

        {
          type: 'operation',
          name: "dummyOperation",
          status: 0, 
          operands: ["arg1", "arg2"]
        }

      ] })

    })

  })


})


