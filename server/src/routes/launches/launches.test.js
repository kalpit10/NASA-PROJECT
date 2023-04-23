const request = require("supertest");
const app = require("../../app.js");

const { mongoConnect, mongoDisconnect } = require("../../services/mongo.js");

//we have written all our tests in one single main describe function
describe(`Launches API`, () => {
  //before all tests just setup the mongodb
  beforeAll(async () => {
    await mongoConnect();
  });

  //after all the tests have passed, exit it(this all is done to save some errors)
  afterAll(async () => {
    await mongoDisconnect();
  });

  jest.setTimeout(10000);

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      //request takes the app object we pass it calling the listen function on that object and then allows us to make requests
      //directly against the resulting http server
      const response = await request(app)
        .get("/v1/launches")
        //checks thae content is json or not
        .expect("Content-Type", /json/)
        .expect(200);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-1652 b",
      launchDate: "January 4, 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-1652 b",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-1652 b",
      launchDate: "zoot",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        //to send some data we call send()
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      //valueOf() returns the stored time value in milliseconds since midnight, January 1, 1970 UTC.
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    }, 10000);

    //FOR ERROR HANDLING
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        //to send some data we call send()
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      //to test that objects have the same types as well as structure
      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        //to send some data we call send()
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      //to test that objects have the same types as well as structure
      expect(response.body).toStrictEqual({
        error: "Invalid launch Date",
      });
    });
  });
});
