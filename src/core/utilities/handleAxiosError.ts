export const handleAxiosError = (
  error: any
): { code: number; statusText: string } => {
  if (error.response) {
    /**
     * The request was made and the server responded with a status code
     * that falls out of the range of 2xx
     */
    return {
      code: error.response.status,
      statusText: error.response.statusText,
    };
  } else if (error.request) {
    /**
     * The request was made but no response was received
     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
     * http.ClientRequest in node.js
     */
    return {
      code: 500,
      statusText: `the request was made but no response was received`,
    };
  } else {
    /**
     * Something happened in setting up the request that triggered an Error
     */
    return {
      code: 500,
      statusText: `something happened in setting up the request that triggered an Error`,
    };
  }
};
