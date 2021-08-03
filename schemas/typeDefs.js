const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID
    name: String
    email: String
    favorite: [Favorites]
  }

  type Auth {
    token: ID
    user: User
  }

  type Query {
    user: User
    manga(name: String!): [Manga]
  }

  type Manga {
    name: String
    alternative: [String]
    authors: [String]
    status: Strings
    genres: [String]
    last_updated: String
    description: String
    manga_url: String
    chapters: [Chapter]
  }

  type Chapter {
    chapter: String
    views: Number
    upload_date: String
    chapter_url: String
  }

  type Favorites {
    manga: [Manga]
  }

  type Mutation {
    addUser(name: String!, email: String!, password: String!): Auth
    updateUser(name: String, email: String, password: String): User
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
