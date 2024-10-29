import { useQuery, useLazyQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";

import { AppContext } from "../App";

const FilterButton = ({ genre, filterBooks, isActive }) => {
  const handleClick = () => {
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

  // Using AppContext to pass active genre to App for subscription
  const { activeGenre, setActiveGenre } = useContext(AppContext);

  const location = useLocation();

  // Reset favouriteGenre on route change for consistency
  useEffect(() => {
    setActiveGenre("");
  }, [location.pathname]);

  const result = useQuery(ALL_BOOKS);

  // Using lazy query to fetch books by genre on button press
  const [getBooksByGenre, { loading, error, data }] = useLazyQuery(ALL_BOOKS);

  const books = result?.data?.allBooks;

  // Set filters and books once ALL_BOOKS completes
  useEffect(() => {
    if (books) {
      const genres = books.reduce((a, b) => {
        b.genres.map((g) => !a.includes(g) && a.push(g));
        return a;
      }, []);
      if (filteredBooks.length < 1) {
        setFilteredBooks(books);
      }
      setAllGenres(genres);
    }
  }, [books]);

  useEffect(() => {
    if (data) {
      setFilteredBooks(data.allBooks);
    }
  }, [data]);

  if (result.loading || loading) {
    return <div>loading...</div>;
  }

  const handleFilter = (genre) => {
    // If activeGenre is set, query books in that genre, if not, query all books
    if (activeGenre === genre) {
      setActiveGenre("");
      getBooksByGenre();
    } else {
      setActiveGenre(genre);
      getBooksByGenre({
        variables: { genre: genre },
        fetchPolicy: "cache-and-network", // This keeps the view consistent
      });
    }
  };

  return (
    <div>
      <h2>books</h2>
      {activeGenre ? <div>In genre: {`[ ${activeGenre} ]`}</div> : null}
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
          <FilterButton
            key={g}
            genre={g}
            filterBooks={handleFilter}
            isActive={activeGenre === g}
          />
        ))}
      </div>
    </div>
  );
};

export default Books;
