const express = require("express");
//destructured way of writing getAllPlanets is a function that is coming from planets.controller
const { httpGetAllPlanets } = require("./planets.controller");

const planetsRouter = express.Router();

planetsRouter.get("/planets", httpGetAllPlanets);

module.exports = planetsRouter;
