/*
 *******************************************************************************
 *
 *          %name:  excel_workflow.js %
 *    %derived_by:  Sagar Trehan %
 *
 *       %version:  1 %
 *       %release:  excel-read/1.0 %
 * %date_modified:  Sat Jul 25 %
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
const excelWorkflow = {};
const XLSX = require("xlsx");
const path = require("path");
const config = require("../../config/config");
const logger = config.logger;
const filename = "excel-workflow";

excelWorkflow.excelReadAndSubstitute = async (apiname, username, files) => {
  const functionName = "excelReadAndSubstitute";
  const successResponse = {
    responseCode: 0,
    response: {},
    successMsg: "",
  };
  const failureResponse = {
    responseCode: -1,
    response: {},
    errorMsg: "",
  };
  try {
    if (!files || !files.file) {
      failureResponse.errorMsg = "No File found. Please attach a file";
      return Promise.reject(failureResponse);
    }
    const extname = path.extname(files.file.name);
    if (extname !== ".xls" && extname !== ".xlsx") {
      failureResponse.errorMsg = "Wrong File Type. Please upload correct file";
      return Promise.reject(failureResponse);
    }
    //Read the file
    const workbook = XLSX.read(files.file.data);

    var sheet_name_list = workbook.SheetNames;
    const sheet = sheet_name_list.find((x) => {
      return x === "Sheet1";
    });

    if (!sheet) {
      failureResponse.errorMsg = "Sheet1  not found in the xlsx";
      return Promise.reject(failureResponse);
    }

    // Convert to 2D Array
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (data[i][j] === "<Profile1>") {
          data[i][j] = "ABC";
        } else if (data[i][j] === "<Profile2>") {
          data[i][j] = "DEF";
        }
      }
    }

    //Convert to Sheet with modified value
    var ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });

    //Write a new Workbook with updated value
    var newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, ws, sheet);
    XLSX.writeFile(newWorkbook, "out.xlsx", { type: "file" });
    return Promise.resolve(successResponse);
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: ${apiname} : Response Sent :`, err);
    return Promise.reject(err);
  }
};
module.exports = excelWorkflow;
