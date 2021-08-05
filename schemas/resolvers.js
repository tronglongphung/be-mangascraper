const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");
const { getChapterPanels } = require("../utils/chapterPanels");
const Manga = require("manganelo-scraper").scraper;

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id);
        return user;
      }
      throw new AuthenticationError("Not logged in");
    },

    manga: async (parent, args, context, info) => {
      info.cacheControl.setCacheHint({ maxAge: 30 });
      const data = await Manga.getMangaDataFromSearch(args.name);
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
