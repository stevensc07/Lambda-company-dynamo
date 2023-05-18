"use strict";
require("dotenv").config();
const dynamoDb = require("./services/dynamo.service");
const ajvO = require("ajv");
const ajvRq = new ajvO();
const schemaCreateCompanyRq = require("./schemas/rqCreateCompanySchema.json");
const schemaGetCompanyRq = require("./schemas/rqGetCompanySchema.json");

const validateCreateRq = ajvRq.compile(schemaCreateCompanyRq);
const validateGetRq = ajvRq.compile(schemaGetCompanyRq);

module.exports.createCompany = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateCreateRq(data);

  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateCreateRq.errors[0],
      }),
    };
  }

  const { fullName, nit, address, phone } = data;
  const creationDate = new Date().toDateString();
  const updateDate = creationDate;
  const PK = "#COMPANIES";
  const SK = "#COMPANY#" + nit;
  const payload = {
    PK,
    SK,
    fullName,
    nit,
    address,
    phone,
    creationDate,
    updateDate,
  };

  try {
    await dynamoDb.putItem(
      payload,
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      error: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ message: "success", payload }),
  };
};

module.exports.getCompanies = async () => {
  let resultRequest = {};
  try {
    resultRequest = await dynamoDb.scan(
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    console.log("Error get users: ", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(resultRequest),
  };
};

module.exports.getCompany = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateGetRq(data);
  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateGetRq.errors[0],
      }),
    };
  }

  const { nit } = data;
  let resultRequest;
  try {
    resultRequest = await dynamoDb.scanItem(
      nit,
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    console.log("Error create: ", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      error: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(resultRequest),
  };
};

module.exports.deleteCompany = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateGetRq(data);
  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateGetRq.errors[0],
      }),
    };
  }

  const { nit } = data;
  let resultRequest;
  try {
    resultRequest = await dynamoDb.deleteItem(
      { PK: "#COMPANIES", SK: "#COMPANY#" + nit },
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    console.log("Error create: ", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      error: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(resultRequest),
  };
};
