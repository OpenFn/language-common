"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.each = each;

var _ = require("./");

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 *
 * It also ensures the results of an operation make their way back into
 * the state's references.
 *
 * @example <caption>Simple Example</caption>
 * each("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @constructor
 * @param {<Source>} dataSource - JSONPath referencing a point in `state`.
 * @param {function} operation - The operation needed to be repeated.
 * @returns {<Operation>}
 */
function each(dataSource, operation) {
  if (!dataSource) {
    throw new TypeError("dataSource argument for each operation is invalid.");
  }

  return function (prevState) {

    var items = (0, _.asData)(dataSource, prevState);
    var nextState = items.reduce(function (state, data, index) {
      if (state.then) {
        return state.then(function (state) {
          return operation(_extends({}, state, { data: data, index: index }));
        });
      } else {
        return operation(_extends({}, state, { data: data, index: index }));
      }
    }, prevState);

    // Ensure that the data this reducer was passed is returned to it's
    // original state. But allow any other changes to be kept.
    if (nextState.then) {
      return nextState.then(function (nextState) {
        return _extends({}, nextState, { data: prevState.data });
      });
    } else {
      return _extends({}, nextState, { data: prevState.data });
    }
  };
}
