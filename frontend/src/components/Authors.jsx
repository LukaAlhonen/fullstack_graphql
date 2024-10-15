import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, EDIT_BIRTHYEAR } from "../queries";
import Select from "react-select";

const AuthorForm = ({ authors, setError }) => {
  const [born, setBorn] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  const [editBirthyear] = useMutation(EDIT_BIRTHYEAR, {
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join("\n");
      setError(messages);
    },
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    if (!selectedAuthor) {
      setError("Select an author from the drop-down menu");
      return;
    }

    if (!born) {
      setError("Enter a birthyear");
      return;
    }

    await editBirthyear({
      variables: {
        name: selectedAuthor.value,
        setBornTo: parseInt(born, 10),
      },
    });
    setSelectedAuthor(null);
    setBorn("");
  };

  const options = authors.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <Select
            key={selectedAuthor ? selectedAuthor.value : "empty"} // force Select component to re-render after submit
            defaultValue={selectedAuthor || null}
            onChange={setSelectedAuthor}
            options={options}
            placeholder="Select an author from the drop-down list"
            isClearable
          />
        </div>
        <div>
          born{" "}
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

const Authors = ({ setError, isAuthenticated }) => {
  const result = useQuery(ALL_AUTHORS);

  if (result.loading) {
    return <div>loading...</div>;
  }

  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {isAuthenticated() ? (
        <AuthorForm authors={authors} setError={setError} />
      ) : null}
    </div>
  );
};

export default Authors;
