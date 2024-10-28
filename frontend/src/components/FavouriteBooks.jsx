import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../App";

const FavouriteBooks = () => {
  const [books, setBooks] = useState([]);

  // Favourite Genre is passed to App using AppContext
  const { favouriteGenre, setFavouriteGenre } = useContext(AppContext);

  const { loading: loadingMe, data: dataMe } = useQuery(ME);
  const { loading: loadingBooks, data: dataBooks } = useQuery(ALL_BOOKS, {
    skip: !favouriteGenre,
    variables: { genre: favouriteGenre },
  });

  useEffect(() => {
    const genre = dataMe?.me?.favoriteGenre;
    setFavouriteGenre(genre);
  }, [dataMe]);

  useEffect(() => {
    if (dataBooks?.allBooks) {
      setBooks(dataBooks.allBooks);
    }
  }, [dataBooks]);

  if (loadingMe || loadingBooks) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>recommendations</h2>
      Books in your favourite genre <strong>{favouriteGenre}</strong>
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
