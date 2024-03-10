class ApiResponse {
  constructor(statusCode, message = "Request Successful", data = {}) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = true;
  }
}

export default ApiResponse;
