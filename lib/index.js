'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.map = exports.beta = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.execute = execute;
exports.alterState = alterState;
exports.sourceValue = sourceValue;
exports.source = source;
exports.dataPath = dataPath;
exports.dataValue = dataValue;
exports.referencePath = referencePath;
exports.lastReferenceValue = lastReferenceValue;
exports.asData = asData;
exports.each = each;
exports.combine = combine;
exports.join = join;
exports.expandReferences = expandReferences;
exports.field = field;
exports.fields = fields;
exports.merge = merge;
exports.index = index;
exports.arrayToString = arrayToString;
exports.toArray = toArray;
exports.composeNextState = composeNextState;
exports.humanProper = humanProper;

var _fp = require('lodash/fp');

var _JSONPath = require('JSONPath');

var _JSONPath2 = _interopRequireDefault(_JSONPath);

var _beta2 = require('./beta');

var _beta = _interopRequireWildcard(_beta2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.beta = _beta;

/**
 * Execute a sequence of operations.
 * Main outer API for executing expressions.
 * @public
 * @example
 *  execute(
 *    create('foo'),
 *    delete('bar')
 *  )
 * @function
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

/**
 * Runs a function using state.
 * @public
 * @example
 *  alterState(callback)
 * @function
 * @param {Function} func is the function
 * @returns {<Operation>}
 */
function alterState(func) {
  return function (state) {
    return func(state);
  };
}

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @public
 * @example
 *  sourceValue('$.key')
 * @function
 * @param {String} path - JSONPath referencing a point in `state`.
 * @returns {<Operation>}
 */
function sourceValue(path) {
  return function (state) {
    return _JSONPath2.default.eval(state, path)[0];
  };
}

/**
 * Picks out a value from source data.
 * Will return whatever JSONPath returns, which will always be an array.
 * If you need a single value use `sourceValue` instead.
 * @public
 * @example
 *  source('$.key')
 * @function
 * @param {String} path - JSONPath referencing a point in `state`.
 * @returns {Array.<String|Object>}
 */
function source(path) {
  return function (state) {
    return _JSONPath2.default.eval(state, path);
  };
}

/**
 * Ensures a path points at the data.
 * @public
 * @example
 *  dataPath('key')
 * @function
 * @param {string} path - JSONPath referencing a point in `data`.
 * @returns {string}
 */
function dataPath(path) {
  // Remove prepending `$.`, `$` or `.`, in order to ensure the root of the
  // path starts with `$.data.`
  var cleanPath = path.match(/^[\$\.]*(.+)/)[1];
  return "$.data.".concat(cleanPath);
}

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @public
 * @example
 *  dataValue('key')
 * @function
 * @param {String} path - JSONPath referencing a point in `data`.
 * @returns {<Operation>}
 */
function dataValue(path) {
  return sourceValue(dataPath(path));
}

/**
 * Ensures a path points at references.
 * @public
 * @example
 *  referencePath('key')
 * @function
 * @param {string} path - JSONPath referencing a point in `references`.
 * @returns {string}
 */
function referencePath(path) {
  // Remove prepending `$.`, `$` or `.`, in order to ensure the root of the
  // path starts with `$.data.`
  var cleanPath = path.match(/^[\$\.]*(.+)/)[1];
  return "$.references".concat(cleanPath);
}

/**
 * Picks out the last reference value from source data.
 * @public
 * @example
 *  lastReferenceValue('key')
 * @function
 * @param {String} path - JSONPath referencing a point in `references`.
 * @returns {<Operation>}
 */
function lastReferenceValue(path) {
  var lastReferencePath = referencePath("[0]".concat(".", path));

  return sourceValue(lastReferencePath);
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 * @public
 * @example
 * map("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @function
 * @param {string} path - JSONPath referencing a point in `state.data`.
 * @param {function} operation - The operation needed to be repeated.
 * @param {State} state - Runtime state.
 * @returns {<State>}
 */
var map = exports.map = (0, _fp.curry)(function (path, operation, state) {

  switch (typeof path === 'undefined' ? 'undefined' : _typeof(path)) {
    case 'string':
      source(path)(state).map(function (data) {
        return operation({ data: data, references: state.references });
      });
      return state;

    case 'object':
      path.map(function (data) {
        return operation({ data: data, references: state.references });
      });
      return state;

  }
});

/**
 * Simple switcher allowing other expressions to use either a JSONPath or
 * object literals as a data source.
 * - JSONPath referencing a point in `state`
 * - Object Literal of the data itself.
 * - Function to be called with state.
 * @public
 * @example
 *  asData('$.key'| key | callback)
 * @function
 * @param {String|object|function} data
 * @param {object} state - The current state.
 * @returns {array}
 */
function asData(data, state) {
  switch (typeof data === 'undefined' ? 'undefined' : _typeof(data)) {
    case 'string':
      return source(data)(state);
    case 'object':
      return data;
    case 'function':
      return data(state);
  }
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 *
 * It also ensures the results of an operation make their way back into
 * the state's references.
 * @public
 * @example
 * each("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @function
 * @param {DataSource} dataSource - JSONPath referencing a point in `state`.
 * @param {Operation} operation - The operation needed to be repeated.
 * @returns {<Operation>}
 */
function each(dataSource, operation) {
  if (!dataSource) {
    throw new TypeError("dataSource argument for each operation is invalid.");
  }

  return function (state) {
    return asData(dataSource, state).reduce(function (state, data, index) {
      if (state.then) {
        return state.then(function (state) {
          return operation(_extends({}, state, { data: data, index: index }));
        });
      } else {
        return operation(_extends({}, state, { data: data, index: index }));
      }
    }, state);
  };
}

/**
 * Combines two operations into one
 * @public
 * @example
 *  combine(
 *   create('foo'),
 *   delete('bar')
 * )
 * @function
 * @returns {Operation}
 */
function combine() {
  for (var _len2 = arguments.length, operations = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operations[_key2] = arguments[_key2];
  }

  return function (state) {
    return operations.reduce(function (state, operation) {
      if (state.then) {
        return state.then(function (state) {
          return _extends({}, state, operation(state));
        });
      } else {
        return _extends({}, state, operation(state));
      }
    }, state);
  };
}

/**
 * Adds data from a target object
 * @public
 * @example
 *  join('$.key','$.data','newKey')
 * @function
 * @param {String} targetPath - Target path
 * @param {String} sourcePath - Source path
 * @param {String} targetKey - Target Key
 * @returns {<Operation>}
 */
function join(targetPath, sourcePath, targetKey) {
  return function (state) {
    return source(targetPath)(state).map(function (i) {
      return _extends(_defineProperty({}, targetKey, sourceValue(sourcePath)(state)), i);
    });
  };
}

/**
 * Resolves function values.
 * @public
 * @function
 * @param {object} obj - data
 * @returns {<Operation>}
 */
function expandReferences(obj) {
  return function (state) {
    return (0, _fp.mapValues)(function (value) {
      return typeof value == 'function' ? value(state) : value;
    })(obj);
  };
}

/**
 * Returns a key, value pair in an array.
 * @public
 * @example
 *  field('destination_field_name__c', 'value')
 * @function
 * @param {string} key - Name of the field
 * @param {Value} value - The value itself or a sourceable operation.
 * @returns {<Field>}
 */
function field(key, value) {
  return [key, value];
}

/**
 * Zips key value pairs into an object.
 * @public
 * @example
 *  fields(list_of_fields)
 * @function
 * @returns {Object}
 */
function fields() {
  for (var _len3 = arguments.length, fields = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    fields[_key3] = arguments[_key3];
  }

  return (0, _fp.fromPairs)(fields);
}

/**
 * Merges fields into each item in an array.
 * @public
 * @example
 * merge(
 *   "$.books[*]",
 *   fields(
 *     field( "publisher", sourceValue("$.publisher") )
 *   )
 * )
 * @function
 * @param {DataSource} dataSource
 * @param {Object} fields - Group of fields to merge in.
 * @returns {DataSource}
 */
function merge(dataSource, fields) {
  return function (state) {

    var initialData = source(dataSource)(state);
    var additionalData = expandReferences(fields)(state);

    return initialData.reduce(function (acc, dataItem) {
      return [].concat(_toConsumableArray(acc), [_extends({}, dataItem, additionalData)]);
    }, []);
  };
}

/**
 * Returns the index of the current array being iterated.
 * To be used with `each` as a data source.
 * @public
 * @example
 *  index()
 * @function
 * @returns {<DataSource>}
 */
function index() {
  return function (state) {
    return state.index;
  };
}

/**
 * Turns an array into a string, separated by X.
 * @public
 * @example
 *  field("destination_string__c", function(state) {
 *    return arrayToString(dataValue("path_of_array")(state), ', ')
 *  })
 * @function
 * @param {array} arr - Array of toString'able primatives.
 * @param {string} [separator=''] - Separator string.
 * @returns {string}
 */
function arrayToString(arr) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  return Array.apply(null, arr).join(separator);
}

/**
 * Ensures primitive data types are wrapped in an array.
 * Does not affect array objects.
 * @public
 * @example
 *  each(function(state) {
 *    return toArray( dataValue("path_of_array")(state) )
 *  }, ...)
 * @function
 * @param {any} arg - Data required to be in an array
 * @returns {array}
 */
function toArray(arg) {
  return new Array().concat(arg);
}

/**
 * Prepares next state
 * @public
 * @example
 *  composeNextState(state, response)
 * @function
 * @param {State} state - state
 * @param {Object} response - Response to be added
 * @returns {State}
 */
function composeNextState(state, response) {
  return _extends({}, state, {
    data: response,
    references: [].concat(_toConsumableArray(state.references), [state.data])
  });
}

/**
 * Subsitutes underscores for spaces and proper-cases a string
 * @public
 * @example
 *  field("destination_string__c", humanProper(state.data.path_to_string))
 * @function
 * @param {string} str - String that needs converting
 * @returns {string}
 */
function humanProper(str) {
  if (typeof str == "string") {
    return str.replace(/[_-]/g, " ").replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  } else {
    return str;
  }
};
