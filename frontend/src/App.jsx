import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { useApolloClient } from "@apollo/client";

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

  const client = useApolloClient();

  const notify = (e) => {
    setErrorMessage(e);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
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
            path="/login"
            element={<LoginForm setToken={setToken} setError={notify} />}
          />
        </Routes>
      </Router>
      <Notify errorMessage={errorMessage} />
    </div>
  );
};

export default App;
