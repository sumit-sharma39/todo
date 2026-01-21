const database_conn = require("../database/connection");

const AddNewTask = async (req, res) => {
  try {
    const { title, description, bullets, deadline, completed, images } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const query = `
      INSERT INTO todo_data (title, description, bullets, deadline, completed, images)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      title,
      description || "",
      bullets ? JSON.stringify(bullets) : JSON.stringify([]),
      deadline || null,
      completed ?? false,
      images ? JSON.stringify(images) : JSON.stringify([])
    ];

    const result = await database_conn.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("AddNewTask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = AddNewTask;
