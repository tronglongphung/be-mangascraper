const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID
    name: String
    password: String
    email: String
    savedManga: [String]
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
    status: String
    genres: [String]
    last_updated: String
    description: String
    manga_url: String
    chapters: [Chapter]
  }

  type Chapter {
    chapter: String
    views: Float
    upload_date: String
    chapter_url: String
  }

  type Mutation {
    addUser(name: String!, email: String!, password: String!): Auth
    updateUser(name: String, email: String, password: String): User
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
