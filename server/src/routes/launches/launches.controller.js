const {
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
  scheduleNewLaunch,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  //THE MAIN PROBLEM IS THAT LAUNCHES IS STORED INSIDE A MAP AND WE NEET TO RETURN JSON AND MAP DOESNT CONVERT IT IN JSON
  //launches.values() returns an iterable of values in the map
  //we need to convert the map values into a plain object or an array, luckily we have a built in Array method
  //which takes this iterable returned by launches.values and turns it into an array containing all those values
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  //DATE VALIDATION
  launch.launchDate = new Date(launch.launchDate);
  //NaN(Not a Number) checks whether its a number or not
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch Date",
    });
  }
  await scheduleNewLaunch(launch);
  //using return statement for setting status only once
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;

  const existsLaunch = await existsLaunchWithId(launchId);
  if (!existsLaunch) {
    //if launch doesn't exist
    return res.status(404).json({
      error: "Launch not found",
    });
  }
  //if launch does exist
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: `Launch not aborted`,
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
