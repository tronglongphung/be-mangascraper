const { AuthenticationError } = require("apollo-server-express");
const { User, Manga } = require("../models");
const { signToken } = require("../utils/auth");
const { getChapterPanels } = require("../utils/chapterPanels");
const manganelo = require("manganelo-scraper").scraper;
const { fetchCoverImg } = require("../utils/fetchCoverImg");

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate(
          "savedManga"
        );
        return user;
      }
      throw new AuthenticationError("Not logged in");
    },

    allLocalMangas: async () => {
      const mangaLocal = await Manga.find({}).limit(40);
      return mangaLocal;
    },

    mangas: async (parent, { name }, context, info) => {
      const mangaLocal = await Manga.find({
        name: { $regex: name, $options: "i" },
      }).exec();

      console.log({ mangaLocal: mangaLocal });

      if (mangaLocal.length === 0) {
        const data = await manganelo.getMangaDataFromSearch(name);

        for (const item of data) {
          const coverImg = await fetchCoverImg(item.url);

          item["url"] = `${item.url.split("/")[3]}`;
          item["coverImg"] = coverImg;
        }

        // const mangaLocal = await Manga.find({});
        // // try and filter names out
        // const checkDupes = await data.filter(!mangaLocal.name){
        //   return Manga.insertMany(data)
        // }

        const newMangas = await Manga.insertMany(data);
        console.log({ newMangas });
        return newMangas;
      } else {
        return mangaLocal;
      }
    },

    manga: async (parent, { key }, context, info) => {
      const url = `https://readmanganato.com/${key}`;
      const mangaLocal = await Manga.findOne({ url: key }).exec();

      console.log({ mangaLocal: mangaLocal });

      if (!mangaLocal) {
        const data = await manganelo.getMangaDataFromURL(url);
        console.log(data.chapters);
        const coverImg = await fetchCoverImg(url);

        const newManga = await Manga.create({
          name: data.name,
          status: data.status,
          chapters: data.chapters,
          url: `${data.url.split("/")[3]}`,
          coverImg: coverImg,
        });

        console.log({ newManga });

        return newManga;
      } else {
        return mangaLocal;
      }
    },

    chapter: async (parent, args, context, info) => {
      const panelData = await getChapterPanels(args.url);
      const cleanPanels = panelData.map((panel) => {
        return {
          id: panel.id,
          uri: `/${panel.uri.split("/")[5]}/${panel.uri.split("/")[6]}/${
            panel.uri.split("/")[7]
          }`,
        };
      });
      return cleanPanels;
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    addFavourite: async (parent, { id }, context) => {
      console.log({ id });
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedManga: id } },
          {
            new: true,
          }
        );
        // console.log({ user });
        return user;
      }
    },

    removeFavourite: async (parent, { id }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedManga: id } },
          {
            new: true,
          }
        );
        console.log({ user });
        return user;
      }
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
  },
};

module.exports = resolvers;
