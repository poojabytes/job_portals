const express = require("express");
const authRouter = require("./authRoutes");
const userRouter = require("./userRoutes");

const allRoutes = express.Router();
const defaultRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/user",
    route: userRouter,
  },
];

defaultRoutes.forEach((route) => {
  allRoutes.use(route.path, route.route);
});

module.exports = allRoutes;


