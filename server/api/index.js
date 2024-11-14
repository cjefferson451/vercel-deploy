const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Configure CORS
app.use(cors({
  origin: ["https://vercel-deploy-front-kappa.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// MongoDB URI
const MONGO_URI = 'mongodb+srv://user1:user@cluster0.ynj6l.mongodb.net/mydatabase';

// Track connection status
let isConnected = false;

// Function to connect to MongoDB
async function connectToDatabase() {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, {
      // Optionally specify additional settings (e.g., pool size)
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error('Database connection failed');
  }
}

// Connect to database at startup
connectToDatabase().catch(err => console.error(err));

// Define Schema and Model
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});
const Item = mongoose.model("Item", ItemSchema);

// CRUD Routes

// Get all items
app.get("/api/items", async (req, res) => {
  try {
    await connectToDatabase(); // Ensure connection before processing request
    console.log("Fetching items...");

    // Get page and limit from query parameters, default to page 1 and limit 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const start = Date.now(); // Start timing
    const items = await Item.find().skip(skip).limit(limit); // Use pagination
    const duration = Date.now() - start; // Calculate query duration
    console.log(`Items fetched successfully in ${duration}ms, number of items: ${items.length}`);
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
});
//d
// Create a new item
app.post("/api/items", async (req, res) => {
  try {
    await connectToDatabase(); // Ensure connection before processing request
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }
    const newItem = new Item({ name, description });
    await newItem.save();
    console.log("Item created:", newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Error creating item" });
  }
});

// Update an item
app.put("/api/items/:id", async (req, res) => {
  try {
    await connectToDatabase(); // Ensure connection before processing request
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    console.log("Item updated:", updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Error updating item" });
  }
});

// Delete an item
app.delete("/api/items/:id", async (req, res) => {
  try {
    await connectToDatabase(); // Ensure connection before processing request
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    console.log("Item deleted:", deletedItem);
    res.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item" });
  }
});

// Root route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});



module.exports = app;