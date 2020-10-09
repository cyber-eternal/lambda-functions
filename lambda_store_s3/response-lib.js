const success = (body) => {
  return buildResponse(200, body);
};

const failure = (body) => {
  return buildResponse(409, body);
};

const buildResponse = (statusCode, body, contentType) => {
  const response = {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  };
  if (contentType) response.headers['Content-Type'] = contentType;
  return response;
};

module.exports = {
  success,
  failure
}