const dotenv = require("dotenv").config({
  path: `config/.env.${process.env.NODE_ENV || "local"}`,
});
const express = require("express");
const cors = require("cors");
const { globalResponse } = require("./utils/others");
const ErrorMiddleware = require("./middleware/Error");
const allRoutes = require("./routes/index");
const { morgan, customFormat } = require("./utils/morganSettings");

const app = express();

/****************morgan Middleware********************************/
app.use(morgan(customFormat));
app.use(globalResponse);

/*****************CORS*******************/
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

/*************************************Routes****************************************/
app.use("/api/v1", allRoutes);

app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.send("Assignment Backend Running.....");
});

module.exports = app;

app.use("*", (req, res) => {
  res.send("Route not found");
});
app.use(ErrorMiddleware);


