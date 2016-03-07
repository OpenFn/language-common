import { expect } from 'chai';
import { execute, fields, field } from '../src';
import Utils from '../src/utils';

describe("history", () => {

  let initialState = {}

  function wrapOperation(operation) {
    return function(...operands) {
      return (state) => {
        // Finalize operands
        const finalOperands = Utils.finalizeOperands(...operands)(state)

        // Fufill the operation with the operands.
        try {
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
        } catch (e) {
          // Merge in the result of this operation.
          return {
            ...state,
            // Append to existing history list, or add it to a new list
            history: [ ...state.history || [], 
              {
                type: 'operation',
                name: operation.name,
                status: 1,
                finalOperands,
                error: e.toString()
              }
            ]
          }
          
        }

      }
    }
  }

  it('catches errors and attaches them to history', function() {

    function errorOperation(arg1, arg2) {
      return state => {
        throw new Error('An error has occured.')
      }
    }

    let operation = wrapOperation(errorOperation)

    return execute(
      operation("arg1", "arg2")
    )({}).then( (state) => {

      expect(state).to.eql({ history: [

        {
          type: 'operation',
          name: "errorOperation",
          status: 1, 
          finalOperands: ["arg1", "arg2"],
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


