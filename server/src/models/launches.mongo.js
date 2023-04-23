const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  target: {
    //this id would allow us to lookup planets from planets collection
    //it will check if the planet provided is one of the planets stored in mongo
    // type: mongoose.ObjectId,
    type: String,
    //our target is a reference pointing to a planet
    // ref: "Planet",
  },
  //Array of Strings
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const launches = mongoose.model("Launch", launchesSchema);
module.exports = launches;
