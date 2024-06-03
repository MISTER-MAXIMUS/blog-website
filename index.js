import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url"; // Import necessary functions from url module

// PostgreSQL client setup
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',        // replace with your PostgreSQL username
  host: 'localhost',       // replace with your PostgreSQL host
  database: 'world',       // replace with your PostgreSQL database name
  password: 'Raj@12345',   // replace with your PostgreSQL password
  port: 5432,              // replace with your PostgreSQL port
});
pool.connect();

const app = express();
const port = 4000;

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set views directory

// GET all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving posts", error });
  }
});

// GET a specific post by id
app.get("/posts/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving post", error });
  }
});

// POST a new post
app.post("/posts", async (req, res) => {
  const { title, content, author } = req.body;
  const date = new Date();
  try {
    const result = await pool.query(
      "INSERT INTO posts (title, content, author, date) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, author, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
});

// PATCH a post
app.patch("/posts/:id", async (req, res) => {
  const { title, content, author } = req.body;
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *",
      [title, content, author, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error });
  }
});

// DELETE a specific post
app.delete("/posts/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query("DELETE FROM posts WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
