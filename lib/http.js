"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;

var _ = require("../");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function get(requestParams) {
  return state => {
    const params = (0, _.expandReferences)(requestParams)(state);
    return (0, _axios.default)({
      method: 'get',
      ...params
    });
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


function post(requestParams) {
  return state => {
    const params = (0, _.expandReferences)(requestParams)(state);
    return (0, _axios.default)({
      method: 'post',
      ...params
    });
  };
}
