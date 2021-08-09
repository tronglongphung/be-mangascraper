const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");
const { getChapterPanels } = require("../utils/chapterPanels");
const Manga = require("manganelo-scraper").scraper;
const { fetchCoverImg } = require("../utils/fetchCoverImg");

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id);
        return user;
      }
      throw new AuthenticationError("Not logged in");
    },

    mangaData: async (parent, args, context, info) => {
      const rawData = await Manga.getMangaDataFromURL(args.url);

      return {
        name: rawData.name,
        status: rawData.status,
        chapters: rawData.chapters,
        url: `${rawData.url.split("/")[3]}`,
        coverImg: coverImg,
      };
    },

    mangas: async (parent, args, context, info) => {
      const data = await Manga.getMangaDataFromSearch(args.name);

      for (const item of data) {
        const coverImg = await fetchCoverImg(item.url);
        // console.log(coverImg);
        item["cover"] = coverImg;
      }

      return data.map((item) => ({
        name: item.name,
        status: item.status,
        chapters: item.chapters,
        url: `${item.url.split("/")[3]}`,
        coverImg: item.cover,
      }));
    },

    manga: async (parent, args, context, info) => {
      // mangaKey should look like manga-aa951409
      const data = await Manga.getMangaDataFromURL(
        `https://readmanganato.com/${args.key}`
        // `https://readmanganato.com/manga-aa951409`
      );
      console.log(data);
      return data;
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
      console.log(panelData);
      return cleanPanels;
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    updateUser: async (parent, args, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(context.user._id, args, {
          new: true,
        });
      }
      throw new AuthenticationError("Not logged in");
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
