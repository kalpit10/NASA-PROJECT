require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URL =
  process.env.MONGO_URL;

//once will allow the open event to trigger only once
mongoose.connection.once("open", () => {
  console.log("MongoDB Connection ready!!");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
