// admin.js
const express = require("express");
const bodyParser = require("body-parser");
const { User, Admin } = require("./db");

const cors = require("cors");

// Enable CORS for all routes

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Define routes for your admin panel

app.post("/admin", async (req, res) => {
  const body = req.body;
  console.log(body);

  await Admin.create({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: body.password,
  });

  res.json({
    message: "admin created",
  });
});

// 1. List all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "chatId name city country");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// 2. User blocking
app.patch("/users/block/:chatId", async (req, res) => {
  const { chatId } = req.params;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { chatId: chatId },
      { $set: { allowed: false } },
      { new: true }
    );
    if (updatedUser) {
      res.json({ message: "User blocked successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//3. user unblocking

app.patch("/users/unblock/:chatId", async (req, res) => {
  const { chatId } = req.params;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { chatId: chatId },
      { $set: { allowed: true } },
      { new: true }
    );
    if (updatedUser) {
      res.json({ message: "User unblocked successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//4. user deletion

app.delete("/users/:chatId", async (req, res) => {
  const { chatId } = req.params;
  try {
    const deleteUser = await User.findOneAndDelete({ chatId: chatId });
    if (deleteUser) {
      res.json({
        message: "user deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//5. message frequency
app.patch("/messageFrequency/:messageNumber", async (req, res) => {
  const { messageNumber } = req.params;
  try {
    const updateMessageFrequency = await Admin.findOneAndUpdate(
      {},
      { $set: { messageFrequency: messageNumber } },
      { new: true }
    );
    if (updateMessageFrequency) {
      res.json({ message: "message frequency updated successfully" });
    } else {
      res.status(404).json({ message: "message frequency not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// 6. Manage API keys

app.get("/apiKey", async (req, res) => {
  try {
    const admins = await Admin.find({});
    const apiKeys = admins.map((admin) => admin.apiKey).flat(); // Extract and flatten the API keys

    res.json({ apiKeys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/apiKey", async (req, res) => {
  try {
    const { apiKey } = req.body;
    console.log(apiKey);

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required." });
    }
    // Add the new apiKey to the Admin collection
    await Admin.updateOne({}, { $push: { apiKey } });

    res
      .status(200)
      .json({ success: true, message: "API key added successfully" });
  } catch (error) {
    console.error("Error adding API key:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// DELETE route to remove an API key
app.delete("/apiKey/:keyToDelete", async (req, res) => {
  try {
    const { keyToDelete } = req.params;

    // Assuming apiKey is an array field in your Admin model
    await Admin.updateOne(
      {},
      { $pull: { apiKey: keyToDelete } },
      { new: true }
    );

    res.status(200).json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. Manage message frequency
// Define routes for managing message frequency

app.listen(port, () => {
  console.log(`Admin panel is running on port ${port}`);
});
