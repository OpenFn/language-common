'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodashFp = require('lodash-fp');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @typedef {Function} Selector
 * @param {<State>} state
 */

var Utils = function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: 'finalizeOperands',

    /**
     * Finalizes operands for an operation.
     * Many operations take functions as arguments, such as dataValue.
     * In order to use these, they must be evaluated at runtime.
     * This is intended to be the successsor for `expandReferences`.
     * @constructor
     * @param {...operands} operands - A list of arguments/operands.
     * @returns {<Selector>.<Array>}
     */
    value: function finalizeOperands() {
      for (var _len = arguments.length, operands = Array(_len), _key = 0; _key < _len; _key++) {
        operands[_key] = arguments[_key];
      }

      return function (state) {
        return (0, _lodashFp.map)(function (operand) {

          // When it's a function, assume it's an operation and call it with state.
          if (typeof operand == 'function') {
            return operand(state);
          }

          // When it's an object, map over the values and finalize any functions.
          // NOTE: We may need to recurse here.
          if ((0, _lodashFp.isObject)(operand)) {
            return (0, _lodashFp.mapValues)(function (value) {
              return typeof value == 'function' ? value(state) : value;
            }, operand);
          }

          // NOTE: Not yet implemented.
          if ((0, _lodashFp.isArray)(operand)) {
            throw new Error("Cannot finalize operands for Arrays.");
          }

          // Will already be finalized, i.e. string, boolean, number, etc
          return operand;
        }, operands);
      };
    }
  }]);

  return Utils;
}();

exports.default = Utils;
