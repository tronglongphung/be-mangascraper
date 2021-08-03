require("dotenv").config();
const db = require("./connection");
const { User } = require("../models");

db.once("open", async () => {
  await User.deleteMany({});

  await User.create({
    name: "Pamela",
    email: "pamela@testmail.com",
    password: "password12345",
    savedManga: ["naruto"],
  });

  await User.create({
    name: "Elijah",
    email: "eholt@testmail.com",
    password: "password12345",
    savedManga: ["bleach"],
  });

  console.log("users seeded");

  process.exit();
});
