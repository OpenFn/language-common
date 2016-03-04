import { map, isObject, isArray, mapValues } from 'lodash-fp';

/**
 * @typedef {Function} Selector
 * @param {<State>} state
 */

export default class Utils {

  /**
   * Finalizes operands for an operation.
   * Many operations take functions as arguments, such as dataValue.
   * In order to use these, they must be evaluated at runtime.
   * This is intended to be the successsor for `expandReferences`.
   * @constructor
   * @param {...operands} operands - A list of arguments/operands.
   * @returns {<Selector>.<Array>}
   */
  static finalizeOperands(...operands) {
    return state => {
      return map(function(operand) {

        // When it's a function, assume it's an operation and call it with state.
        if ( typeof operand == 'function' ) { return operand(state); }

        // When it's an object, map over the values and finalize any functions.
        // NOTE: We may need to recurse here.
        if ( isObject(operand) ) {
          return mapValues(function(value) {
            return typeof value == 'function' ? value(state) : value;
          }, operand)
        }

        // NOTE: Not yet implemented.
        if ( isArray(operand) ) {
          throw new Error("Cannot finalize operands for Arrays.");
        }

        // Will already be finalized, i.e. string, boolean, number, etc
        return operand;

      }, operands); 
    }
  }

}
