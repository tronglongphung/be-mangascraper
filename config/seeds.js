require("dotenv").config();
const db = require("./connection");
const { User, MangaTitle } = require("../models");
const mangaList = require("./mangaList");

db.once("open", async () => {
  await User.deleteMany({});

  await User.create({
    name: "Pamela",
    email: "pamela@testmail.com",
    password: "password12345",
    savedManga: ["naruto"],
  });

  for (const manga of mangaList) {
    await MangaTitle.create(manga);
  }

  console.log("users seeded");

  process.exit();
});
