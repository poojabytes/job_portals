const morgan = require("morgan");
const chalk = require("chalk");
const { colorizeText } = require("./others");

morgan.token("source", function (req) {
  return req.get("User-Agent") || "Unknown Source";
});

function customFormat(tokens, req, res) {
  const status = res.statusCode;
  const color = status >= 200 && status < 300 ? chalk.green : chalk.red;

  const methodAndUrl = color(
    `${tokens.method(req, res)} ${tokens.url(req, res)}`
  );

  return `${colorizeText(
    "API Route: ",
    "yellow"
  )} "${methodAndUrl}" Status: ${color(status)}`;
}

module.exports = { morgan, customFormat };


