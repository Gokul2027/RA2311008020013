import * as middleware from "../dist/index.js";

export const Log = middleware.Log ?? middleware.default;
export const setAuthToken = middleware.setAuthToken;
export const clearAuthToken = middleware.clearAuthToken;
export default middleware.Log ?? middleware.default;
