import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState, useEffect } from "react";

const FilterButton = ({ genre, filterBooks }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);

    filterBooks(genre);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        borderRadius: "5px",
        borderColor: isActive ? "blue" : "gray",
      }}
    >
      {genre}
    </button>
  );
};

const Books = () => {
  const [allGenres, setAllGenres] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filter, setFilter] = useState([]);

  const result = useQuery(ALL_BOOKS);

  const books = result?.data?.allBooks;

  useEffect(() => {
    if (books) {
      const genres = books.reduce((a, b) => {
        b.genres.map((g) => !a.includes(g) && a.push(g));
        return a;
      }, []);

      setAllGenres(genres);
    }
  }, [books]);

  useEffect(() => {
    if (books) {
      if (filter.length > 0) {
        setFilteredBooks(
          books.filter((b) => b.genres.some((g) => filter.includes(g))),
        );
      } else {
        setFilteredBooks(books);
      }
    }
  }, [filter, books]);

  if (result.loading) {
    return <div>loading...</div>;
  }

  const handleFilter = (genre) => {
    if (filter.includes(genre)) {
      const f = filter.filter((g) => g !== genre);
      setFilter(f);
    } else {
      const f = [...filter, genre];
      setFilter(f);
    }
  };

  return (
    <div>
      <h2>books</h2>
      {filter.length > 0 ? (
        <div>In genres: {filter.map((f) => `[${f}]`).join(" - ")} </div>
      ) : null}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <div>
          <strong>filter:</strong>
        </div>
        {allGenres.map((g) => (
          <FilterButton key={g} genre={g} filterBooks={handleFilter} />
        ))}
      </div>
    </div>
  );
};

export default Books;
