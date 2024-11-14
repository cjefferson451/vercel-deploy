// App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("https://vercel-deploy-eosin-kappa.vercel.app/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleAddItem = async () => {
    const newItem = { name, description };
    try {
      if (editId) {
        await axios.put(`https://vercel-deploy-eosin-kappa.vercel.app/api/items/${editId}`, newItem);
        setEditId(null);
      } else {
        await axios.post("https://vercel-deploy-eosin-kappa.vercel.app/api/items", newItem);
      }
      setName("");
      setDescription("");
      fetchItems();
    } catch (error) {
      console.error("Error adding/updating item:", error);
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setDescription(item.description);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://vercel-deploy-eosin-kappa.vercel.app/api/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div>
      <h1>CRUD App</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleAddItem}>
        {editId ? "Update Item" : "Add Item"}
      </button>

      <ul>
        {items.map((item) => (
          <li key={item._id}>
            <strong>{item.name}</strong> - {item.description}
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
