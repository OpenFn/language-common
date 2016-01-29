"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
/**
 * Execute a sequence of operations.
 * Main outer API for executing expressions.
 * @example 
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Promise}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  return function (state) {
    var start = Promise.resolve(state);

    return operations.reduce(function (acc, operation) {
      return acc.then(operation);
    }, start);
  };
}
