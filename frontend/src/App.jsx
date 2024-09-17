import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";

const App = () => {
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
        <Route path="/authors" element={<Authors />} />
        <Route path="/books" element={<Books />} />
        <Route path="/addbook" element={<NewBook />} />
      </Routes>
    </Router>
  );
};

export default App;
