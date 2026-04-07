import { useEffect, useState } from "react";
import { getUsers, createUser } from "./Api";

function App() {
  // STATE FORM
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // STATE DATA
  const [users, setUsers] = useState([]);

  // LOAD DATA SAAT HALAMAN DIBUKA
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault(); // cegah reload page

    await createUser({
      name: name,
      email: email,
    });

    setName("");
    setEmail("");

    loadUsers(); // refresh data
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Form User (React + Go)</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit">Simpan</button>
      </form>

      <hr />

      {/* LIST DATA */}
      <h3>Data Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
