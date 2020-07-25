/*
 *******************************************************************************
 *
 *          %name:  excel_route.js %
 *    %derived_by:  Sagar Trehan %
 *
 *       %version:  1 %
 *       %release:  excel-read/1.0 %
 * %date_modified:  Sat Jul 25 2020 %
 *
 * Date          By             Description
 * ------------  -----------    -----------
 * Jul 25, 2020   Sagar        created
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
const express = require("express");
const excelRoute = express.Router();
const excelWorkflow = require("../../app/excel/excel_workflow");
const config = require("../../config/config");
const logger = config.logger;
const api = require("../../lib/api");
const fs = require("fs");
const filename = "excel-route";

excelRoute.post("/v1/excelRead", async function (req, res) {
  let excelReadReq;
  const isValidJson = api.IsJsonString(req.body.data);
  if (!isValidJson) {
    const failureResponse = {
      responseCode: -1,
      response: {},
      errorMsg: "Not a valid Json Request",
    };
    return api.ok(req, res, failureResponse);
  }
  excelReadReq = JSON.parse(req.body.data);
  const apiConstants = {
    url: "/v1/excelRead",
    apiName: "Read Excel and Substitute",
    header: req.headers.apiname,
    username: excelReadReq.id,
  };
  try {
    logger.info(`${apiConstants.username}: ${filename}:post: ${apiConstants.url}: ${apiConstants.header}: ${apiConstants.apiName}: Request Received: ${JSON.stringify(excelReadReq)}`);
    logger.info(`${apiConstants.username}: ${filename}:post: ${apiConstants.url}: ${apiConstants.header}: ${apiConstants.apiName}: File Received: ${api.fetchFileNames(req.files)}`);
    const results = await excelWorkflow.excelReadAndSubstitute(apiConstants.header, apiConstants.username, req.files);
    logger.info(`${apiConstants.username}: ${filename}:post: ${apiConstants.url}: ${apiConstants.header}: ${apiConstants.apiName}: Response Sent: ${JSON.stringify(results)}`);
    res.download("out.xlsx", () => {
      fs.unlinkSync("out.xlsx");
    });
  } catch (err) {
    logger.error(`${apiConstants.username}: ${filename}:post: ${apiConstants.url}: ${apiConstants.header}: ${apiConstants.apiName}: Response Sent: ${JSON.stringify(err)}`);
    return api.ok(req, res, err);
  }
});

module.exports = excelRoute;
