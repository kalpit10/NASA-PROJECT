const http = require("http");

//config() function populates the process.env variables with the information
require("dotenv").config();
const app = require("./app");

const { mongoConnect } = require("./services/mongo");

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

//it checks if there is port specified in environment and if not it will run on 8000
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  //we cant use await without async so we put it inside a function with server.listen also and then call the startServer()
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

startServer();
