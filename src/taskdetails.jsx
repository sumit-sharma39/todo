import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./taskdetail.css";
import { BASE_URL } from "./config";

export function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTask() {
      try {
        const response = await axios.get(`${BASE_URL}/todo/${id}`);
        const data = response.data;

        /* ---------------- BULLETS ---------------- */
        let bullets = [];
        if (Array.isArray(data.bullets)) bullets = data.bullets;
        else if (typeof data.bullets === "string") {
          try {
            bullets = JSON.parse(data.bullets);
          } catch {
            bullets = data.bullets ? [data.bullets] : [];
          }
        }

        /* ---------------- IMAGES ---------------- */
        let images = [];
        if (Array.isArray(data.image)) {
          images = data.image;
        } else if (typeof data.image === "string") {
          try {
            const parsed = JSON.parse(data.image);
            if (Array.isArray(parsed)) images = parsed;
          } catch {
            const match = data.image.match(/^\{(.*)\}$/);
            if (match) {
              images = match[1]
                .split(",")
                .map((s) => s.replace(/"/g, "").trim());
            }
          }
        }

        images = images.filter(
          (url) =>
            typeof url === "string" &&
            url.startsWith("http") &&
            url.includes("cloudinary")
        );

        setTask({
          title: data.title || "Untitled Task",
          description: data.description || "",
          deadline: data.deadline || "",
          bullets,
          images,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError(true);
        setLoading(false);
      }
    }

    fetchTask();
  }, [id]);

  function formatDate(date) {
    if (!date) return "";
    const parsed = new Date(date);
    if (isNaN(parsed)) return "";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) return <p className="loading">Loading task...</p>;
  if (error) return <p className="error">Unable to load task.</p>;
  if (!task) return null;

  return (
    <div className="TaskDetailPage">
      {/* -------- HEADER ACTIONS -------- */}
      <div className="task-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button
          className="edit-btn"
          onClick={() => navigate(`/edit/${id}`)}
        >
          ✏️ Edit
        </button>
      </div>

      <h2 className="task-title">{task.title}</h2>

      {task.deadline && (
        <p className="task-deadline">
          Deadline: {formatDate(task.deadline)}
        </p>
      )}

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      {task.bullets.length > 0 && (
        <ul className="task-bullets">
          {task.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}

      {/* -------- IMAGES -------- */}
      {task.images.length > 0 ? (
        <div className="image-grid">
          {task.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Task image ${i + 1}`}
              className="task-image"
              loading="lazy"
              onError={(e) => {
                console.error("Image failed to load:", img);
                e.target.style.display = "none";
              }}
            />
          ))}
        </div>
      ) : (
        <p className="no-images">No images uploaded for this task.</p>
      )}
    </div>
  );
}
