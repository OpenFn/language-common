import { JSONPath } from 'jsonpath-plus';
import * as http from './http';
export { http };

export interface State {
  configuration: object;
  data: object;
  references?: Array<any>;
  index?: number;
}

export interface Resolvable<T> {
  (state: State): T;
}

export type DataSource = object | string | Selector<object | string>;

export interface Operation<T = Promise<State> | State> {
  (state: State): T;
}

export interface Selector<T> {
  (state: State): T;
}

export type Field = [string, string | object | any[]];

/**
 * Execute a sequence of operations.
 * Main outer API for executing expressions.
 * @example
 *  execute(
 *    create('foo'),
 *    delete('bar')
 *  )
 */
export function execute(...operations: Array<Operation>): Operation {
  return state => {
    const start = Promise.resolve(state);

    return operations.reduce((acc, operation) => {
      return acc.then(operation);
    }, start);
  };
}

/**
 * alias for "fn()"
 */
export function alterState(func: Operation): Operation {
  return fn(func);
}

/**
 * Creates a custom step (or operation) for more flexible job writing.
 * @example
 * fn(state => {
 *   // do some things to state
 *   return state;
 * });
 */
export function fn(func: Operation): Operation {
  return state => {
    return func(state);
  };
}

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @example
 * sourceValue('$.key')
 * @param path - JSONPath referencing a point in `state`.
 */
export function sourceValue(path: string): Selector<Array<String | Object>> {
  return state => {
    return JSONPath({ path, json: state })[0];
  };
}

/**
 * Picks out a value from source data.
 * Will return whatever JSONPath returns, which will always be an array.
 * If you need a single value use `sourceValue` instead.
 * @example
 * source('$.key')
 * @param  path - JSONPath referencing a point in `state`.
 */
export function source(path: string): Selector<Array<any>> {
  return state => {
    return JSONPath({ path, json: state });
  };
}

/**
 * Remove prepending `$.`, `$` or `.`, in order to ensure the root of the
 * path starts with `$.data.`
 * @example
 * dataPath('key')
 * @param path - JSONPath referencing a point in `data`.
 */
export function dataPath(path: string): string {
  const matches = path.match(/^[\$\.]*(.+)/);
  if (matches) {
    return '$.data.'.concat(matches[1]);
  }

  return path;
}

/**
 * Picks out a single value from the source data object—usually `state.data`.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @example
 * dataValue('key')
 * @param path - JSONPath referencing a point in `data`.
 */
export function dataValue(path: string) {
  return sourceValue(dataPath(path));
}

/**
 * Ensures a path points at references.
 * @example
 * referencePath('key')
 * @param path - JSONPath referencing a point in `references`.
 */
export function referencePath(path: string): string {
  const matches = path.match(/^[\$\.]*(.+)/);

  if (matches) {
    return '$.references'.concat(matches[1]);
  }

  return path;
}

/**
 * Picks out the last reference value from source data.
 * @example
 * lastReferenceValue('key')
 * @param path - JSONPath referencing a point in `references`.
 */
export function lastReferenceValue(path: string) {
  const lastReferencePath = referencePath('[0]'.concat('.', path));

  return sourceValue(lastReferencePath);
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
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
// DEPRECATED
// export function map(path: string, operation: Operation): Operation {
//   return state => {
//     switch (typeof path) {
//       case 'string':
//         source(path)(state).map(function (data) {
//           return operation({...state, data});
//         });
//         return state;

//       case 'object':
//         path.map(function (data) {
//           return operation({...state, data});
//         });
//         return state;
//     }
//   };
// }

/**
 * Simple switcher allowing other expressions to use either a JSONPath or
 * object literals as a data source.
 * - JSONPath referencing a point in `state`
 * - Object Literal of the data itself.
 * - Function to be called with state.
 * @example
 * asData('$.key'| key | callback)
 * @param data
 * @param state - The current state.
 */
export function asData(data: DataSource, state: State): any {
  switch (typeof data) {
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
 * @example
 * each("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @param dataSource - JSONPath referencing a point in `state`.
 * @param operation - The operation needed to be repeated.
 */
export function each(dataSource: DataSource, operation: Function): Operation {
  if (!dataSource) {
    throw new TypeError('dataSource argument for each operation is invalid.');
  }

  return state => {
    return asData(dataSource, state).reduce((state, data, index) => {
      if (state.then) {
        return state.then(state => {
          return operation({ ...state, data, index });
        });
      } else {
        return operation({ ...state, data, index });
      }
    }, state);
  };
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
 * @example
 *  each("$.[*]",
 *    create("SObject",
 *    field("FirstName", sourceValue("$.firstName")))
 *  )
 * @param dataSource - JSONPath referencing a point in `state`.
 * @param operation - The operation needed to be repeated.
 */

export const beta = {
  each: (dataSource: DataSource, operation: Operation): Operation => {
    if (!dataSource) {
      throw new TypeError('dataSource argument for each operation is invalid.');
    }

    return prevState => {
      const items = asData(dataSource, prevState);
      const nextState = items.reduce((state, data, index) => {
        if (state.then) {
          return state.then(state => {
            return operation({ ...state, data, index });
          });
        } else {
          return operation({ ...state, data, index });
        }
      }, prevState);

      // Ensure that the data this reducer was passed is returned to it's
      // original state. But allow any other changes to be kept.
      if (nextState.then) {
        return nextState.then(nextState => ({
          ...nextState,
          data: prevState.data,
        }));
      } else {
        return { ...nextState, data: prevState.data };
      }
    };
  },
};

/**
 * Combines two operations into one
 * @example
 * combine(
 *   create('foo'),
 *   delete('bar')
 * )
 * @function
 * @param operations - Operations to be performed.
 */
export function combine(...operations: Array<Operation>): Operation {
  return execute(...operations);
  // return state => {
  //   return operations.reduce((state, operation) => {
  //     if (state.then) {
  //       return state.then(state => {
  //         return { ...state, ...operation(state) };
  //       });
  //     } else {
  //       return { ...state, ...operation(state) };
  //     }
  //   }, state);
  // };
}

/**
 * Adds data from a target object
 * @example
 * join('$.key','$.data','newKey')
 * @function
 * @param targetPath - Target path
 * @param sourcePath - Source path
 * @param targetKey - Target Key
 */
export function join(
  targetPath: string,
  sourcePath: string,
  targetKey: string
): Operation {
  return state => {
    return {
      ...state,
      ...source(targetPath)(state).map(i => {
        return { [targetKey]: sourceValue(sourcePath)(state), ...i };
      }),
    };
  };
}

/**
 * Recursively resolves objects that have resolvable values (functions).
 * @function
 * @param value - data
 * @param [skipFilter] - a function which returns true if a value should be skipped
 */
export function expandReferences(
  value: any[] | object | Function,
  skipFilter?: (val: any) => Boolean
): Selector<any> {
  return state => {
    if (skipFilter && skipFilter(value)) return value;

    if (Array.isArray(value)) {
      return value.map(v => expandReferences(v)(state));
    }

    if (typeof value == 'object' && !!value) {
      return Object.keys(value).reduce((acc, key) => {
        return { ...acc, [key]: expandReferences(value[key])(state) };
      }, {});
    }

    if (typeof value == 'function') {
      return expandReferences(value(state))(state);
    }
    return value;
  };
}

/**
 * Returns a key, value pair in an array.
 * @example
 * field('destination_field_name__c', 'value')
 * @param key - Name of the field
 * @param value - The value itself or a sourceable operation.
 */
export function field(key: string, value: any): Field {
  return [key, value];
}

/**
 * Converts a list of pairs (in arrays) into an object
 * _Lifted from lodash_.
 * @example
 * fromPairs([["foo", 1], ["bar", 2]])
 * // { "foo": 1, "bar": 2 }
 * @param pairs - list of pairs
 */
function fromPairs(pairs: Array<[string, any]>): object {
  var index = -1,
    length = pairs == null ? 0 : pairs.length,
    result = {};

  while (++index < length) {
    var pair = pairs[index];
    result[pair[0]] = pair[1];
  }
  return result;
}
/**
 * Zips key value pairs into an object.
 * @example
 *  fields(list_of_fields)
 * @param fields - a list of fields
 */
export function fields(...fields: Field[]): object {
  return fromPairs(fields);
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
 * @param dataSource
 * @param {Object} fields - Group of fields to merge in.
 * @returns {DataSource}
 */
export function merge(dataSource: string, fields: object): Operation {
  return state => {
    const initialData = source(dataSource)(state);
    const additionalData = expandReferences(fields)(state);

    return initialData.reduce((acc, dataItem) => {
      return [...acc, { ...dataItem, ...additionalData }];
    }, []);
  };
}

/**
 * Returns the index of the current array being iterated.
 * To be used with `each` as a data source.
 * @example
 * index()
 */
export function index(): Selector<number | undefined> {
  return state => {
    return state.index;
  };
}

/**
 * Turns an array into a string, separated by X.
 * @example
 * field("destination_string__c", function(state) {
 *   return arrayToString(dataValue("path_of_array")(state), ', ')
 * })
 * @param arr - Array of toString'able primatives.
 * @param separator - Separator string.
 */
export function arrayToString(arr: any[], separator: string): string[] {
  return Array.apply(null, arr).join(separator);
}

/**
 * Ensures primitive data types are wrapped in an array.
 * Does not affect array objects.
 * @example
 * each(function(state) {
 *   return toArray( dataValue("path_of_array")(state) )
 * }, ...)
 * @param arg - Data required to be in an array
 */
export function toArray<T>(arg: T): T[] {
  return new Array().concat(arg);
}

/**
 * Prepares next state
 * @example
 * composeNextState(state, response)
 * @param state - state
 * @param response - Response to be added
 */
export function composeNextState(state: State, response: any): State {
  return {
    ...state,
    data: response,
    references: [...(state.references || []), state.data],
  };
}

/**
 * Subsitutes underscores for spaces and proper-cases a string
 * @public
 * @example
 * field("destination_string__c", humanProper(state.data.path_to_string))
 * @function
 * @param str - String that needs converting
 */
export function humanProper(str: string): string {
  if (typeof str == 'string') {
    return str.replace(/[_-]/g, ' ').replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  } else {
    return str;
  }
}

export function splitKeys(obj: object, keys: string[]) {
  return Object.keys(obj).reduce(
    ([keep, split], key) => {
      const value = obj[key];

      if (keys.includes(key)) {
        return [keep, { ...split, [key]: value }];
      }

      return [{ ...keep, [key]: value }, split];
    },
    [{}, {}]
  );
}
