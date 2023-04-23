const { getAllPlanets } = require("../../models/planets.model");

async function httpGetAllPlanets(req, res) {
  //array to json
  //we use the return statement to make sure we just send the status response once
  return res.status(200).json(await getAllPlanets());
}

module.exports = {
  httpGetAllPlanets,
};
