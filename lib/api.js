const config = require("../config/config");
const logger = config.logger;
const api = {};
const path = require("path");

const Status = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNSUPPORTED_ACTION: 405,
  VALIDATION_FAILED: 422,
  SERVER_ERROR: 500,
};

const jsonResponse = (res, body, options) => {
  options = options || {};
  options.status = options.status || Status.OK;
  res.status(options.status).json(body || null);
};

api.ok = (req, res, data) => {
  if (req && req.body && req.body.timestamp) {
    data.timestamp = req.body.timestamp;
    logger.info("For Request Tracking", JSON.stringify(data));
  }
  jsonResponse(res, data, {
    status: Status.OK,
  });
};
api.serverError = function (req, res, data) {
  jsonResponse(res, data, {
    status: Status.SERVER_ERROR,
  });
};
api.unauthorized = function (req, res, data) {
  // eslint-disable-next-line no-undef
  var errMessageRet = Buffer.from(data.errorMsg).toString("base64");
  res.setHeader("err-msg", errMessageRet);
  jsonResponse(res, data, {
    status: Status.UNAUTHORIZED,
  });
};

api.handleError = (promise) => {
  return promise.then((data) => [undefined, data]).catch((err) => [err, undefined]);
};

api.checkFileExtensions = (username, files) => {
  return new Promise((resolve, reject) => {
    try {
      if (files) {
        const failureResponse = {
          responseCode: -1,
          response: {},
          errorMsg: "",
        };
        for (let file in files) {
          const extname = path.extname(files[file].name);
          if (extname != ".jpg" && extname != ".jpeg" && extname != ".png") {
            failureResponse.errorMsg = "Please upload images Only. Supported Formats: jpg, jpeg and png";
            logger.error(`${username}: common: checkFileExtensions: : Error Received :`, failureResponse);
            return reject(failureResponse);
          }
        }
      }
      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
};

api.fetchFileNames = (files) => {
  let fileNamesStr = "";
  const fileNames = [];
  if (files) {
    const keyName = Object.keys(files);
    let i = 0;
    for (let file in files) {
      fileNames.push(`${keyName[i]} : ${files[file].name}`);
      i++;
    }
    fileNamesStr = fileNames.join(",");
  }
  return fileNamesStr;
};

api.IsJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

module.exports = api;
