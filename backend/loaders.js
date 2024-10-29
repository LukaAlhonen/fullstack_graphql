const DataLoader = require("dataloader");
const Book = require("./models/book");

const createLoaders = () => ({
  bookCountLoader: new DataLoader(async (authorIDs) => {
    // Filter books by author id and group by author
    const bookCountsAggregate = await Book.aggregate([
      { $match: { author: { $in: authorIDs } } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]);

    // Map author ID to bookCount and return array of bookCounts corresponding to authorIDs
    const bookCountsMap = bookCountsAggregate.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return authorIDs.map((id) => bookCountsMap[id] || 0);
  }),
});

module.exports = createLoaders;
