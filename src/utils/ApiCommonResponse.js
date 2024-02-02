class ApiCommonResponse {
    /**
     * Creates an instance of ApiCommonResponse.
     *
     * @param {number} statusCode - The HTTP status code for the success response.
     * @param {string} message - The success message.
     * @param {any} data - Additional data to be included in the success response.
     */
    constructor(statusCode, message, data = null) {
      this.statusCode = statusCode;
      this.message = message;
      this.data = data;
    }
  }
  
  module.exports = ApiCommonResponse;
  