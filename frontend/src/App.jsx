import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useState, createContext } from "react";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import FavouriteBooks from "./components/FavouriteBooks";

import { useApolloClient, useSubscription } from "@apollo/client";

import { ALL_BOOKS, BOOK_ADDED } from "./queries";

export const AppContext = createContext();

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <div>
      <h3 style={{ color: "red" }}>{errorMessage}</h3>
    </div>
  );
};

const App = () => {
  // Initiate token from localStorage so user stays logged in after page refresh
  const [token, setToken] = useState(
    localStorage.getItem("bookstore-user-token"),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotifying, setIsNotifying] = useState(false);
  const [favouriteGenre, setFavouriteGenre] = useState(null); // This is set in FavouriteBooks through AppContext
  const [activeGenre, setActiveGenre] = useState("");

  const client = useApolloClient();

  // This function adds a new book to the cache while making sure it is only added once
  const updateCache = (cache, query, addedBook) => {
    const isUnique = (b) => {
      let seen = new Set();
      return b.filter((item) => {
        let k = item.title;
        return seen.has(k) ? false : seen.add(k);
      });
    };

    const cachedBooks = cache.readQuery(query);

    if (
      !cachedBooks ||
      !cachedBooks.allBooks ||
      cachedBooks.allBooks.length === 0
    ) {
      return { allBooks: [addedBook] };
    } else {
      cache.updateQuery(query, ({ allBooks }) => {
        return { allBooks: isUnique(allBooks.concat(addedBook)) };
      });
    }
  };

  // All subscriptions are handled in App in order to keep the addition of
  // new items consistent over multiple browser sessions
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;

      try {
        if (addedBook.genres.includes(favouriteGenre)) {
          // Update query for allBooks with genre param
          updateCache(
            client.cache,
            {
              query: ALL_BOOKS,
              variables: { genre: favouriteGenre },
            },
            addedBook,
          );
        }
        // Update query for allBooks with activeGenre param
        if (activeGenre) {
          updateCache(
            client.cache,
            { query: ALL_BOOKS, variables: { genre: activeGenre } },
            addedBook,
          );
        }
        // Update query for allBooks without genre param
        updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
        notify(`Added Book: ${addedBook.title}`);
      } catch (error) {
        console.log(error);
        notify(
          error.message || "An error has occured while updating the cache",
        );
      }
    },
  });

  const notify = (e) => {
    if (isNotifying) return;
    setIsNotifying(true);
    setErrorMessage(e);
    setTimeout(() => {
      setErrorMessage(null);
      setIsNotifying(false);
    }, 10000);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setFavouriteGenre(null);
  };

  const linkStyle = {
    padding: "2px 6px",
    margin: "5px",
    display: "inline-block",
    border: "2px solid black",
    borderRadius: "4px",
    textDecoration: "none",
    color: "black",
    cursor: "pointer",
    backgroundColor: "buttonface",
  };

  return (
    <AppContext.Provider
      value={{ favouriteGenre, setFavouriteGenre, activeGenre, setActiveGenre }}
    >
      <div>
        <Router>
          <div>
            <Link style={linkStyle} to="/authors">
              authors
            </Link>
            <Link style={linkStyle} to="/books">
              books
            </Link>
            {token ? (
              <Link style={linkStyle} to="/addbook">
                add book
              </Link>
            ) : (
              <Link style={linkStyle} to="/login">
                login
              </Link>
            )}
            {token ? (
              <Link style={linkStyle} to="/recommended">
                recommended
              </Link>
            ) : null}
            {token ? (
              <Link style={linkStyle} to="/authors" onClick={handleLogout}>
                logout
              </Link>
            ) : null}
          </div>

          <Routes>
            <Route path="/" element={<Navigate to="/authors" replace />} />
            <Route
              path="/authors"
              element={
                <Authors
                  setError={notify}
                  isAuthenticated={() => token != null}
                />
              }
            />
            <Route path="/books" element={<Books />} />
            <Route
              path="/addbook"
              element={
                <ProtectedRoute>
                  <NewBook setError={notify} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommended"
              element={
                <ProtectedRoute>
                  <FavouriteBooks setError={notify} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={<LoginForm setToken={setToken} setError={notify} />}
            />
          </Routes>
        </Router>
        <Notify errorMessage={errorMessage} />
      </div>
    </AppContext.Provider>
  );
};

export default App;
