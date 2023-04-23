const axios = require("axios");
const Launch = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log(`Downloading launch data from spacex`);
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      //turning it to false so that we can get all the results instead of just a few numbers
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    //flatMap converts the customers list in our payloads into a single list for that launch
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded!");
  }
  await populateLaunches();
}

async function findLaunch(filter) {
  return await Launch.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  //we are sorting the launches, and taking the first one as the first flightNumber
  // - means sorting in descending order
  const latestLaunch = await Launch.findOne().sort(`-flightNumber`);

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await Launch.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  //if flightNumber is same then update
  await Launch.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  //THIS IS CALLED REFERENTIAL INTEGRITY(mainly used in sql)
  // Referential integrity is a rule that ensures that the relationships between tables in a database are maintained
  // correctly. It means that if a table refers to another table, then the data being referred to should exist in the other
  // table. For example, if a table contains orders, the customer ID in each order should correspond to a valid customer
  // in the customer table.

  //we will verify that the planets we are choosing are one from the database and not some random planet
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  //we cannot use req,res for throwing errors here as we are in a lower section of our api, we will use built in Error
  if (!planet) {
    //always call the new keyword
    throw new Error(`No matching planet found.!`);
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Kalpit", "ISRO"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await Launch.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
