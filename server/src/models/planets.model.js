//DESTRUCTURING
//csv stands for comma separated values
const { parse } = require("csv-parse");
const path = require("path");
const fs = require("fs");
const Planet = require(`./planets.mongo`);
//to open a file and read

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    //amount of starlight they get measuring
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    //planetary radius cant be more than 1.6 times earth's radius
    planet["koi_prad"] < 1.6
  );
}

/*
  we are using a Promise here because when we require this file then it starts to parse the csv data but it might not
  fetch all the data and we store this into an array. So by using a promise we can say that it will run this func.
  only when all the things are resolved and all the planets are found before listening to our request in server.js
*/
async function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      //pipe function is meant to connect a readable stream source to writable stream destination
      //here kepler is source and parse is destination
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      //on func. returns the event emitter that it is called on
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })

      .on("error", (err) => {
        console.log(err);
        reject(err);
      })

      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets founds`);
        //we are not passing anything in our resolve function because in .on("data") function we are setting this
        //habitablePlanets array
        resolve();
      });
  });
}

async function getAllPlanets() {
  //find all planets
  return await Planet.find(
    {},
    //to specifically exclude properties which match these names
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function savePlanet(data) {
  try {
    //insert = update = upsert
    //upsert inserts data into collection if it is not there in collection
    //if the document does exist, it updates the document
    //for creating new document in MONGO
    await Planet.updateOne(
      {
        keplerName: data.kepler_name,
      },
      {
        keplerName: data.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`Could not save planet ${error}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};

// parse();
