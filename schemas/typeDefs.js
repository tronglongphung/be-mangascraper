const { gql } = require("apollo-server-express");

const typeDefs = gql`
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

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
    chapter(url: String!): [Panel]
  }

  type Rating {
    ratingFromFive: String
    votes: Float
  }

  type Manga {
    name: String
    alternative: [String]
    authors: [String]
    status: String
    genres: [String]
    rating: Rating
    updated: String
    description: String
    url: String
    chapters: [Chapter]
  }

  type Chapter {
    chapter: String
    views: Float
    upload_date: String
    url: String
  }

  type Panel {
    id: String
    uri: String
  }

  type Mutation {
    addUser(name: String!, email: String!, password: String!): Auth
    updateUser(name: String, email: String, password: String): User
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
