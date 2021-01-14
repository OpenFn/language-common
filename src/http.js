import { expandReferences } from "../";
import axios from "axios";

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
  return (state) => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: "get", ...params });
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
  return (state) => {
    const params = expandReferences(requestParams)(state);

    return axios({ method: "post", ...params });
  };
}
