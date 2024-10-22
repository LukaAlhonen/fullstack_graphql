const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/users");

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      // If no filter -> return all books
      if (!args.author && !args.genre) {
        const books = await Book.find({}).populate("author");

        return books;
      }

      const filter = {};

      // Filter books based on author if arg is present
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        filter.author = author;
      }

      // Filter books based on genre if arg is present
      if (args.genre) {
        filter.genres = args.genre;
      }

      return await Book.find(filter).populate("author");
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    name: (root) => root.name,
    id: (root) => root._id,
    born: (root) => root.born,
    bookCount: async (root) => await Book.countDocuments({ author: root._id }),
  },
  Mutation: {
    addBook: async (root, args, context) => {
      // Check if user is authenticated
      if (!context.currentUser) {
        throw new GraphQLError("Not Authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      // Check if author exists, if not add to db
      let author = await Author.findOne({ name: args.author });

      // Add new author to db
      if (!author) {
        author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError("error saving new author", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          });
        }
      }

      // Create new book and add to db
      const book = new Book({
        title: args.title,
        published: args.published,
        author: author,
        genres: args.genres,
      });

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("error saving new book", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            error,
          },
        });
      }

      pubsub.publish("BOOK_ADDED", { bookAdded: book });

      return book;
    },
    editAuthor: async (root, args, context) => {
      // Check if user is authenticated
      if (!context.currentUser) {
        throw new GraphQLError("Not Authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      // Find author by name and update birthyear if found
      const author = await Author.findOne({ name: args.name });

      try {
        author.born = args.setBornTo;
        await author.save();
      } catch (error) {
        throw new GraphQLError("Edit birthyear failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }

      return author;
    },
    createUser: async (root, args) => {
      const newUser = new User({ ...args });

      try {
        await newUser.save();
      } catch (error) {
        throw new GraphQLError("Create User failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      }

      return newUser;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "password") {
        throw new GraphQLError("Wrong Credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
