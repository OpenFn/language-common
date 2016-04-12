import { curry, reduce, zipObject, mapValues } from 'lodash-fp';
import JSONPath from 'JSONPath';

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
export function execute(...operations) {

  return state => {
    const start = Promise.resolve(state)

    return operations.reduce((acc, operation) => {
      return acc.then(operation);
    }, start)

  }
}

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @constructor
 * @param {String} path - JSONPath referencing a point in `state`.
 * @returns {<Operation>}
 */
export function sourceValue(path) {
  return state => {
    return JSONPath.eval(state, path)[0]
  }
}

/**
 * Picks out a value from source data.
 * Will return whatever JSONPath returns, which will always be an array.
 * If you need a single value use `sourceValue` instead.
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state`.
 * @param {State} state - Runtime state.
 * @returns {Array.<String|Object>}
 */
export function source(path) {
  return (state) => {
    return JSONPath.eval(state, path)
  }
}

/**
 * Ensures a path points at the data.
 * @constructor
 * @param {string} path - JSONPath referencing a point in `data`.
 * @returns {string}
 */
export function dataPath(path) {
  // Remove prepending `$.`, `$` or `.`, in order to ensure the root of the
  // path starts with `$.data.`
  const cleanPath = path.match(/^[\$\.]*(.+)/)[1]
  return "$.data.".concat(cleanPath)
}

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @constructor
 * @param {String} path - JSONPath referencing a point in `data`.
 * @returns {<Operation>}
 */
export function dataValue(path) {
  return sourceValue(dataPath(path))
}

/**
 * Ensures a path points at references.
 * @constructor
 * @param {string} path - JSONPath referencing a point in `references`.
 * @returns {string}
 */
export function referencePath(path) {
  // Remove prepending `$.`, `$` or `.`, in order to ensure the root of the
  // path starts with `$.data.`
  const cleanPath = path.match(/^[\$\.]*(.+)/)[1]
  return "$.references".concat(cleanPath)
}

export function lastReferenceValue(path) {
  const lastReferencePath = referencePath("[0]".concat(".",path))

  return sourceValue(lastReferencePath)
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 * @example <caption>Simple Map</caption>
 * map("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state.data`.
 * @param {function} operation - The operation needed to be repeated.
 * @param {State} state - Runtime state.
 * @returns {<State>}
 */
export const map = curry(function(path, operation, state) {

  switch (typeof path) {
    case 'string':
      source(path)(state).map(function(data) {
        return operation({data, references: state.references});
      });
      return state

    case 'object':
      path.map(function(data) {
        return operation({data, references: state.references});
      });
      return state

  }
});

/**
 * Simple switcher allowing other expressions to use either a JSONPath or
 * object literals as a data source.
 * @constructor
 * @param {string|object|function} data
 * - JSONPath referencing a point in `state`
 * - Object Literal of the data itself.
 * - Function to be called with state.
 * @param {object} state - The current state.
 * @returns {array}
 */
function asData(data, state) {
  switch (typeof data) {
    case 'string':
      return source(data)(state)
    case 'object':
      return data
    case 'function':
      return data(state)
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
export function each(dataSource, operation) {
  if (!dataSource) {
    throw new TypeError("dataSource argument for each operation is invalid.")
  }

  return (state) => {
    return asData(dataSource,state).
      reduce(
        (state, data, index) => {
          if (state.then) {
            return state.then((state) => {
              return operation({ ...state, data, index })
            })
          } else {
            return operation({ ...state, data, index })
          }
        },
        state
      )

  }
}

/**
 * Combines two operations into one
 * @constructor
 * @param {...operations} operations - Any unfufilled operation.
 * @returns {<Operation>}
 */
export function combine(...operations) {
  return (state) => {
    return operations.reduce((state,operation) => {
      if (state.then) {
        return state.then((state) => {
          return { ...state, ...operation(state) }
        })
      } else {
        return { ...state, ...operation(state) }
      }
    }, state)
  }
}

export function join(targetPath, sourcePath, targetKey) {
  return (state) => {
    return source(targetPath)(state).map((i) => {
      return { [targetKey]: sourceValue(sourcePath)(state), ...i }
    })
  }
}

/**
 * Resolves function values.
 * @experimental this is likely to change
 * @constructor
 * @param {object} obj - data
 * @returns {<Operation>}
 */
export function expandReferences(obj) {
  return state => {
    return mapValues(function(value) {
      return typeof value == 'function' ? value(state) : value;
    })(obj);
  }
}

/**
 * Returns a key, value pair in an array.
 * @constructor
 * @param {string} key - Name of the field
 * @param {Value} value - The value itself or a sourceable operation.
 * @returns {<Field>}
 */
export function field(key, value) {
  return [ key, value ]
}

/**
 * Zips key value pairs into an object.
 * @example <caption>Example</caption>
 * create("SObject",
 *   field("FirstName", sourceValue("$.firstName"))
 * )
 * @constructor
 * @param {...fields} fields - List of fields
 * @returns {object}
 */
export function fields(...fields) {
  return zipObject(fields,null)
}

/**
 * Merges fields into each item in an array.
 * @example <caption>Copy publisher into every book.</caption>
 * merge(
 *   "$.books[*]",
 *   fields(
 *     field( "publisher", sourceValue("$.publisher") )
 *   )
 * )
 * @constructor
 * @param {<DataSource>} dataSource
 * @param {object} fields - Group of fields to merge in.
 * @returns {<DataSource>}
 */
export function merge(dataSource, fields) {
  return state => {

    const initialData = source(dataSource)(state)
    const additionalData = expandReferences(fields)(state)

    return (
      initialData.reduce( (acc, dataItem) => {
        return [ ...acc, { ...dataItem, ...additionalData } ]
      }, [] )
    )
  };
}

/**
 * Returns the index of the current array being iterated.
 * To be used with `each` as a data source.
 * @constructor
 * @returns {<DataSource>}
 */
export function index() {
  return state => {
    return state.index
  }
}

/**
 * Turns an array into a string, separated by X.
 * @constructor
 * @returns {<DataSource>}
 *
 * @example <caption>Array of Values to comma separated string.</caption>
 *  field("destination_string__c", function(state) {
 *    return arrayToString(dataValue("path_of_array")(state), ', ')
 *  })
 *
 */
export function arrayToString(arr, separator='') {
  return Array.apply(null, arr).join(separator)
}
