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
    savedManga: [Manga]
  }

  type Auth {
    token: ID
    user: User
  }

  type Query {
    user: User
    mangas(name: String!): [Manga]
    manga(key: String!): Manga
    chapter(url: String!): [Panel]
    allLocalMangas: [Manga]
  }

  type Rating {
    ratingFromFive: String
    votes: Float
  }

  type Manga {
    _id: ID
    name: String
    coverImg: String
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
    addFavourite(id: ID!): User
    removeFavourite(id: ID!): User
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
