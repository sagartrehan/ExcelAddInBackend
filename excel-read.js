/*
 *******************************************************************************
 *
 *          %name:  excel-read.js %
 *    %derived_by:  Sagar Trehan %
 *
 *       %version:  1 %
 *       %release:  excel-read/1.0 %
 * %date_modified:  Thu Feb 14 12:14:32 2020 %
 *
 * Date          By             Description
 * ------------  -----------    -----------
 * Feb 14, 2020   Sagar        created
 *******************************************************************************
 * Copyright (c) 2019 Inspiron Labs Inc. All Rights Reserved.
 *
 * The copyright to this program herein is the property of Inspiron
 * Labs Inc.. The program may be used and/or copied only with
 * written permission of Inspiron Labs Inc. or in accordance with the
 * terms and conditions stipulated in the agreement/contract under
 * which the program has been supplied.
 *******************************************************************************
 */
/*jshint esversion: 6 */

const express = require("express");
const config = require("./config/config");
const app = express();
const port = process.env.PORT || config.SERVER.PORT;
const environment = process.env.NODE_ENV || config.SERVER.ENVIRONMENT;
const logger = config.logger;
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
let server;
const excelRoute = require("./routes/excel/excel_route");
const path = require("path");

// configuration ===============================================================
// Remove winston's console logger in production mode.
/* istanbul ignore next */
if (logger.loggers.default.transports.length > 0) {
  if (logger.loggers.default.transports[0].name === "console" && environment === "production" && !config.LOG.CONSOLE_PRINT) {
    try {
      logger.remove(logger.transports.Console);
    } catch (err) {}
  }
}
global.appRoot = path.resolve(__dirname);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,username,apiname,Authorization");
  next();
});

app.use(express.static(__dirname + "/public")); // set the static files location /public/img will be /img for users
app.use(
  bodyParser.urlencoded({
    extended: "true",
  })
);
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

/**
 * Security Settings.
 */

app.disable("x-powered-by");
app.enable("trust proxy"); //Enable only when behind nginx.

app.set("title", config.APP_TITLE);
app.set("version", config.APP_VERSION);
app.set("port", port);
app.set("env", environment);

// routes for User Case Rest Api ======================================================================

app.use("/", excelRoute);

const startServer = () => {
  logger.info("SERVER - Starting process...", {
    title: app.get("title"),
    version: app.get("version"),
    port: app.get("port"),
    NODE_ENV: app.get("env"),
    pid: process.pid,
  });
  server = app.listen(app.get("port"));
  server.timeout = config.SERVER.TIMEOUT;
  logger.info("App listening on port " + port);
};

startServer();

const shutdown = async () => {
  try {
    logger.info("Shutting down ");
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
};

// If the Node process ends, close the orawrap connection & the Express server.
process.on("SIGINT", function () {
  logger.error("SIGINT Received");
  shutdown();
});

/* istanbul ignore next */
process.on("SIGTERM", function () {
  logger.error("SIGTERM Received");
  shutdown();
});

process.on("exit", function () {
  logger.error("Exit Received");
});

process.on("uncaughtException", function (err) {
  logger.error("Error occurred: " + err.stack);
  shutdown();
});
