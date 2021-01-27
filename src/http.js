import { expandReferences } from '../';
import axios from 'axios';
import https from 'https';
exports.axios = axios;

/**
 * Recursively resolves objects that have resolvable values (functions), but
 * omits HTTP request specific modules: `FormData` and `https`.
 * @public
 * @function
 * @param {object} value - data
 * @returns {<Operation>}
 */
export function expandRequestReferences(value) {
  return state => {
    if (Array.isArray(value)) {
      return value.map(v => expandRequestReferences(v)(state));
    }

    if (typeof value == 'object' && !!value && value.data?._streams) {
      // NOTE: no expansion is possible on a `FormData` module.
      return value;
    }

    if (typeof value == 'object' && !!value && value.httpsAgent?._events) {
      // NOTE: only expand options for the httpsAgent module.
      const { httpsAgent, ...rest } = value;
      const { options, ...nonExpandable } = httpsAgent;

      return {
        ...expandReferences(rest)(state),
        httpsAgent: {
          options: expandReferences(options)(state),
          ...nonExpandable,
        },
      };
    }

    if (typeof value == 'object' && !!value) {
      return Object.keys(value).reduce((acc, key) => {
        return { ...acc, [key]: expandRequestReferences(value[key])(state) };
      }, {});
    }

    if (typeof value == 'function') {
      return expandRequestReferences(value(state))(state);
    }

    return value;
  };
}

/**
 * Make a GET request
 * @public
 * @function
 * @param {object} requestParams - Supports the exact parameters as Axios. See {@link https://github.com/axios/axios#axios-api here}
 * @returns {Operation} - Function which takes state and returns a Promise
 * @example <caption>Get an item with a specified id from state</caption>
 *  get({
 *      url: state => `https://www.example.com/api/items/${state.id},
 *      headers: {"content-type": "application/json"}
 * });
 */
export function get(requestParams) {
  return state => {
    const params = expandRequestReferences(requestParams)(state);

    return axios({ method: 'get', ...params });
  };
}

/**
 * Make a POST request
 * @public
 * @function
 * @param {object} requestParams - Supports the exact parameters as Axios. See {@link https://github.com/axios/axios#axios-api here}
 * @example <caption>Sending a payload with data that comes from state</caption>
 * post({
 *   url: "https://example.com",
 *   body: (state) => state.data
 * });
 * @example <caption> Capturing the response for later use in state </caption>
 * alterState((state) => {
 *   return post({
 *     url: "https://example.com",
 *     body: (state) => state.data
 *   })(state).then(({response}) => {
 *    state.responseData = response.data
 *   })
 * });
 * @returns {Operation} - Function which takes state and returns a Promise
 */
export function post(requestParams) {
  return state => {
    const params = expandRequestReferences(requestParams)(state);

    return axios({ method: 'post', ...params });
  };
}

/**
 * Make a DELETE request
 * @public
 * @function
 * @param {object} requestParams - Supports the exact parameters as Axios. See {@link https://github.com/axios/axios#axios-api here}
 * @example <caption>Deleting a record with data that comes from state</caption>
 * delete({
 *    url: state => `https://www.example.com/api/items/${state.id}`,
 *  })(state);
 * @returns {Operation} - Function which takes state and returns a Promise
 */
function del(requestParams) {
  return state => {
    const params = expandRequestReferences(requestParams)(state);

    return axios({ method: 'delete', ...params });
  };
}

exports.delete = del;

/**
 * Make a HEAD request
 * @public
 * @function
 * @param {object} requestParams - Supports the exact parameters as Axios. See {@link https://github.com/axios/axios#axios-api here}
 * @example <caption>Gets the headers that would be returned if the HEAD request's URL was instead requested with the HTTP GET method</caption>
 * head({
 *   url: 'https://www.example.com/api/items',
 * });
 * @returns {Operation} - Function which takes state and returns a Promise
 */
export function head(requestParams) {
  return state => {
    const params = expandRequestReferences(requestParams)(state);

    return axios({ method: 'head', ...params });
  };
}

/**
 * Make a PUT request
 * @public
 * @function
 * @param {object} requestParams - Supports the exact parameters as Axios. See {@link https://github.com/axios/axios#axios-api here}
 * @example <caption>Creates a new resource or replaces a representation of the target resource with the request payload, with data from state.</caption>
 * put({
 *   url: state => `https://www.example.com/api/items/${state.id}`,
 *   data: state => state.data
 * });
 * @returns {Operation} - Function which takes state and returns a Promise
 */
export function put(requestParams) {
  return state => {
    const params = expandRequestReferences(requestParams)(state);

    return axios({ method: 'put', ...params });
  };
}

/**
 * Make a PATCH request
 * @public
 * @function
 * @param {object} requestParams - Supports the exact parameters as Axios. See {@link https://github.com/axios/axios#axios-api here}
 * @example <caption>Applies partial modifications to a resource, with data from state.</caption>
 * patch({
 *   url: state => `https://www.example.com/api/items/${state.id}`,
 *   data: state => state.data
 * });
 * @returns {Operation} - Function which takes state and returns a Promise
 */
export function patch(requestParams) {
  return state => {
    const params = expandRequestReferences(requestParams)(state);

    return axios({ method: 'patch', ...params });
  };
}

/**
 * Make a OPTIONS request
 * @public
 * @function
 * @param {object} requestParams - Supports the exact parameters as Axios. See {@link https://github.com/axios/axios#axios-api here}
 * @example <caption>Requests permitted communication options for a given URL or server, with data from state.</caption>
 * options({
 *   url: 'https://www.example.com/api/items',
 * });
 * @returns {Operation} - Function which takes state and returns a Promise
 */
export function options(requestParams) {
  return state => {
    const params = expandRequestReferences(requestParams)(state);

    return axios({ method: 'options', ...params });
  };
}
