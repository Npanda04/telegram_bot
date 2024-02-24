// src/App.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import your existing CSS file for styling

const App = () => {
  const [apiKey, setApiKey] = useState("");
  const [apiKeys, setApiKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedHour, setSelectedHour] = useState(24);

  const addApiKey = async () => {
    try {
      await axios.post("http://localhost:3000/apiKey", { apiKey });
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error adding API key:", error);
    }
  };

  const deleteApiKey = async (keyToDelete) => {
    try {
      await axios.delete(`http://localhost:3000/apiKey/${keyToDelete}`);
      setApiKeys(apiKeys.filter((key) => key !== keyToDelete)); // Remove the deleted key from the state
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  };

  const blockUser = async (chatId) => {
    try {
      await axios.patch(`http://localhost:3000/users/block/${chatId}`);
      // Assuming the server responds with the updated user data, you can update the state accordingly
      setUsers(
        users.map((user) =>
          user.chatId === chatId ? { ...user, allowed: false } : user
        )
      );
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const deleteUser = async (chatId) => {
    try {
      await axios.delete(`http://localhost:3000/users/${chatId}`);
      setUsers(users.filter((user) => user.chatId !== chatId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleHourChange = (event) => {
    setSelectedHour(parseInt(event.target.value, 10));
  };

  const handleUpdate = async () => {
    try {
      // Make a PATCH request to update the message frequency with the selected hour
      await axios.patch(
        `http://localhost:3000/messageFrequency/${selectedHour}`
      );
      console.log("Message frequency updated successfully");
    } catch (error) {
      console.error("Error updating message frequency:", error);
    }
  };

  useEffect(() => {
    // Fetch API keys and user data when the component mounts
    axios
      .all([
        axios.get("http://localhost:3000/apiKey"),
        axios.get("http://localhost:3000/users"),
      ])
      .then(
        axios.spread((keysResponse, usersResponse) => {
          setApiKeys(keysResponse.data.apiKeys);
          setUsers(usersResponse.data); // Assuming the response directly contains user data
        })
      )
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="app-container">
      {" "}
      {/* Added a class for the main container */}
      <h1 className="app-title">Telegram Bot Admin Panel</h1>
      {/* Form for managing API keys */}
      <div className="manage-keys">
        <h2>Manage API Keys</h2>
        <label htmlFor="apiKey">API Key:</label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
        />
        <button type="button" onClick={addApiKey}>
          Add API Key
        </button>
      </div>
      {/* Table to display existing API keys */}
      <div className="existing-keys">
        <h3>Existing API Keys</h3>
        <table>
          <thead>
            <tr>
              <th>API Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key, index) => (
              <tr key={index}>
                <td>{key}</td>
                <td>
                  <button type="button" onClick={() => deleteApiKey(key)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Table to display existing users */}
      <div className="existing-users">
        <h3>Existing Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.city}</td>
                <td>{user.country}</td>
                <td>
                  <button type="button" onClick={() => blockUser(user.chatId)}>
                    Block
                  </button>
                  <button type="button" onClick={() => deleteUser(user.chatId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        {/* Hour Selector */}
        <div className="hour-selector">
          <label htmlFor="hourSelector">Select Hour:</label>
          <select
            id="hourSelector"
            value={selectedHour}
            onChange={handleHourChange}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>

        {/* Button to trigger the update */}
        <button onClick={handleUpdate}>Update Message Frequency</button>
      </div>
    </div>
  );
};

export default App;
