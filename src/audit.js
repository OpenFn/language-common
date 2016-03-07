
/**
 * Finalizes operands for an operation.
 * Many operations take functions as arguments, such as dataValue.
 * In order to use these, they must be evaluated at runtime.
 * This is intended to be the successsor for `expandReferences`.
 * @constructor
 * @param {function} operation - Unexecuted operation
 * @returns {function.<Operation>}
 */
export function audit(operation) {
  return function(...operands) {
    return (state) => {

      const initialDetails = {
        type: 'operation',
        name: operation.name,
        status: null,
        operands
      }

      // Fufill the operation with the operands.
      try {
        const newState = operation(...operands)(state)

        // Merge in the result of this operation.
        return {
          ...newState,
          // Append to existing history list, or add it to a new list
          audit: [ ...newState.audit || [], 
            { ...initialDetails, status: 0 }
          ]
        }
      } catch (e) {

        return {
          ...state,
          // Append to existing history list, or add it to a new list
          audit: [ ...state.audit || [], 
            { ...initialDetails, status: 1, error: e.toString() }
          ]
        }

      }

    }
  }
}
