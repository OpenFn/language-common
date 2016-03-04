import { expect } from 'chai';
import { execute, fields, field } from '../src';
import Utils from '../src/utils';

describe("history", () => {

  let state;

  function wrapOperation(operation) {
    return function(...operands) {
      return (state) => {
        // Finalize operands
        const finalOperands = Utils.finalizeOperands(...operands)(state)
        // Fufill the operation with the operands.
        const newState = operation(...finalOperands)(state)

        // Merge in the result of this operation.
        return {
          ...newState,
          // Append to existing history list, or add it to a new list
          history: [ ...newState.history || [], 
            {
              type: 'operation',
              name: operation.name,
              status: 0,
              finalOperands
            }
          ]
        }
      }
    }
  }

  it('wraps existing functions with meta data', function() {

    function dummyOperation(a,b) {
      return state => {
        return { a, b };
      }
    }

    let operation = wrapOperation(dummyOperation)

    return execute(
      operation("arg1", "arg2")
    )({ a: 2 }).then( (state) => {

      expect(state).to.eql({ a: "arg1", b: "arg2", history: [

        {
          type: 'operation',
          name: "dummyOperation",
          status: 0, 
          finalOperands: ["arg1", "arg2"]
        }

      ] })

    })

  })

  it('attaches finalized operands', function() {

    function dummyOperation(fields) {
      return state => {
        return {};
      }
    }

    let operation = wrapOperation(dummyOperation)

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
          finalOperands: [{ foo: 'bar' }]
        }

      ] })

    })
    
  })

})


