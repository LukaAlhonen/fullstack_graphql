import { useLazyQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";
import { useState, useEffect } from "react";

const FavouriteBooks = ({ setError }) => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [favoriteGenre, setFavoriteGenre] = useState(null);

  // Lazy hooks
  const [getMe] = useLazyQuery(ME);
  const [getBooks] = useLazyQuery(ALL_BOOKS);

  useEffect(() => {
    const performQueries = async () => {
      try {
        const { loading: loadingMe, data: dataMe } = await getMe();
        setLoading(loadingMe);
        const genre = dataMe?.me?.favoriteGenre;

        if (genre) {
          setFavoriteGenre(genre);

          const { loading: loadingBooks, data: dataBooks } = await getBooks({
            variables: { genre },
          });
          setLoading(loadingBooks);
          setBooks(dataBooks?.allBooks || []);
        }
      } catch (error) {
        setError(error.graphQLErrors.map((e) => e.message).join("\n"));
      }
    };
    performQueries();
  }, [getMe, getBooks]);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>recommendations</h2>
      Books in your favourite genre <strong>{favoriteGenre}</strong>
      <div>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FavouriteBooks;
