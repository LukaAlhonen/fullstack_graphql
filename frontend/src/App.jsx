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
  const [errorMessage, setErrorMessage] = useState("");

  const notify = (e) => {
    setErrorMessage(e);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
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
          <Link style={linkStyle} to="/addbook">
            add book
          </Link>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/authors" replace />} />
          <Route path="/authors" element={<Authors setError={notify} />} />
          <Route path="/books" element={<Books />} />
          <Route path="/addbook" element={<NewBook setError={notify} />} />
        </Routes>
      </Router>
      <Notify errorMessage={errorMessage} />
    </div>
  );
};

export default App;
