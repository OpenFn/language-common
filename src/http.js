import { expandReferences } from '../';
import axios from 'axios';

/**
 * Make a GET request
 * @public
 * @example
 *  get("/myendpoint", {
 *      params: {foo: "bar", a: 1},
 *      headers: {"content-type": "application/json"}
 * })
 * @function
 * @requestParams {object} request parameters passed to Axios
 * @returns {Operation}
 */
export function get(requestParams) {
  return state => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: 'get', ...params });
  };
}

/**
 * Make a POST request
 * Supports the exact parameters as Axios. See [here](https://github.com/axios/axios#axios-api)
 * @public
 * Sending a payload with data that comes from state
 * @example
 * post({
 *   url: "https://example.com",
 *   body: (state) => state.data
 * })
 * Capturing the response for later use in state
 * @example
 * alterState((state) => {
 *   return post({
 *     url: "https://example.com",
 *     body: (state) => state.data
 *   })(state).then(({response}) => {
 *    state.responseData = response.data
 *   })
 * })
 * @constructor
 * @requestParams {object} request parameters passed to Axios
 * @returns {Operation}
 */
export function post(requestParams) {
  return state => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: 'post', ...params });
  };
}

/**
 * Make a DELETE request
 * Supports the exact parameters as Axios. See [here](https://github.com/axios/axios#axios-api)
 * @public
 * Deleting a record with data that comes from state
 * @example
 * delete({
 *   url: "https://example.com",
 *   data: (state) => state.data.query
 * })
 * @constructor
 * @requestParams {object} request parameters passed to Axios
 * @returns {Operation}
 */
export function del(requestParams) {
  return state => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: 'delete', ...params });
  };
}

/**
 * Make a HEAD request
 * Supports the exact parameters as Axios. See [here](https://github.com/axios/axios#axios-api)
 * @public
 * Gets the headers that would be returned if the HEAD request's URL was instead requested with the HTTP GET method
 * @example
 * head({
 *   url: "https://example.com",
 *   data: (state) => state.data.query
 * })
 * @constructor
 * @requestParams {object} request parameters passed to Axios
 * @returns {Operation}
 */
export function head(requestParams) {
  return state => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: 'head', ...params });
  };
}

/**
 * Make a PUT request
 * Supports the exact parameters as Axios. See [here](https://github.com/axios/axios#axios-api)
 * @public
 * Creates a new resource or replaces a representation of the target resource with the request payload, with data from state.
 * @example
 * put({
 *   url: "https://example.com",
 *   data: (state) => state.data
 * })
 * @constructor
 * @requestParams {object} request parameters passed to Axios
 * @returns {Operation}
 */
export function put(requestParams) {
  return state => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: 'put', ...params });
  };
}

/**
 * Make a PATCH request
 * Supports the exact parameters as Axios. See [here](https://github.com/axios/axios#axios-api)
 * @public
 * Applies partial modifications to a resource, with data from state.
 * @example
 * put({
 *   url: "https://example.com",
 *   data: (state) => state.data
 * })
 * @constructor
 * @requestParams {object} request parameters passed to Axios
 * @returns {Operation}
 */
export function patch(requestParams) {
  return state => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: 'patch', ...params });
  };
}

/**
 * Make a OPTIONS request
 * Supports the exact parameters as Axios. See [here](https://github.com/axios/axios#axios-api)
 * @public
 * Requests permitted communication options for a given URL or server, with data from state.
 * @example
 * put({
 *   url: "https://example.com",
 *   data: (state) => state.data
 * })
 * @constructor
 * @requestParams {object} request parameters passed to Axios
 * @returns {Operation}
 */
export function options(requestParams) {
  return state => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: 'options', ...params });
  };
}
