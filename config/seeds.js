require("dotenv").config();
const db = require("./connection");
const { User } = require("../models");

db.once("open", async () => {
  await User.create({
    firstName: "Pamela",
    lastName: "Washington",
    email: "pamela@testmail.com",
    password: "password12345",
    savedManga: ["naruto"],
  });

  await User.create({
    firstName: "Elijah",
    lastName: "Holt",
    email: "eholt@testmail.com",
    password: "password12345",
    savedManga: ["bleach"],
  });

  console.log("users seeded");

  process.exit();
});
