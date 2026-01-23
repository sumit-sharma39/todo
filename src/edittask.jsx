import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./edittask.css";
import { HOST_URL , BASE_URL } from "./config";

export default function EditTask({ setTasks }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bulletInput, setBulletInput] = useState("");
  const [bullets, setBullets] = useState([]);
  const [images, setImages] = useState([]);
  const [deadline, setDeadline] = useState("");

  /* ---------------- FETCH TASK ---------------- */
  useEffect(() => {
    async function fetchTask() {
      try {
        // ✅ FIXED ROUTE
        const res = await axios.get(`${HOST_URL}/todo/${id}`);
        const task = res.data;

        setTitle(task.title || "");
        setDescription(task.description || "");
        setBullets(task.bullets || []);
        setDeadline(task.deadline || "");
      } catch (err) {
        console.error("Error fetching task:", err);
      }
    }

    fetchTask();
  }, [id]);

  /* ---------------- BULLET HANDLER ---------------- */
  function addBullet() {
    if (!bulletInput.trim()) return;
    setBullets((prev) => [...prev, bulletInput]);
    setBulletInput("");
  }

  function removeBullet(index) {
    setBullets((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---------------- UPDATE TASK ---------------- */
  async function updateTask() {
    if (!title.trim()) return;

    try {
      const response = await axios.put(`${HOST_URL}/tasks/${id}`, {
        title,
        description,
        bullets,
        deadline,
      });

      const updatedTask = response.data.task;

      let uploadedImages = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("image_url", img));

        const imgRes = await axios.post(
          `${HOST_URL}/todo/${id}/image_url`,
          formData
        );

        uploadedImages = imgRes.data.images || [];
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === Number(id)
            ? { ...updatedTask, images: uploadedImages }
            : t
        )
      );

      navigate("/");
    } catch (err) {
      console.error("Error updating task:", err);
    }
  }

  return (
    <div className="AddPage">
      <h2>Edit Task</h2>

      <input
        className="titlearea"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="disparea"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="date"
        className="deadlinearea"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <div className="bullet-row">
        <input
          type="text"
          placeholder="Add bullet point"
          value={bulletInput}
          onChange={(e) => setBulletInput(e.target.value)}
        />
        <button type="button" className="add-btn" onClick={addBullet}>
          Add
        </button>
      </div>

      {bullets.length > 0 && (
        <ul>
          {bullets.map((b, i) => (
            <li key={i}>
              {b}
              <button onClick={() => removeBullet(i)}>❌</button>
            </li>
          ))}
        </ul>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setImages(Array.from(e.target.files))}
      />

      {images.length > 0 && (
        <div className="image-preview">
          {images.map((img, i) => (
            <img key={i} src={URL.createObjectURL(img)} alt="preview" />
          ))}
        </div>
      )}

      <button className="save-btn" onClick={updateTask}>
        Update Task
      </button>
    </div>
  );
}
