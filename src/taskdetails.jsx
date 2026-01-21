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

        // Normalize bullets
        let bullets = [];
        if (typeof data.bullets === "string") {
          try {
            bullets = JSON.parse(data.bullets);
          } catch {
            bullets = data.bullets ? [data.bullets] : [];
          }
        } else if (Array.isArray(data.bullets)) {
          bullets = data.bullets;
        }

        // Normalize images: ensure it's an array of valid URLs
        let images = [];
        if (Array.isArray(data.images)) {
          images = data.images.filter(
            url => typeof url === 'string' && url.trim().startsWith('http')
          );
        } else if (typeof data.images === "string") {
          // Handle case where backend sends "{url1,url2}" (Postgres array literal)
          try {
            // Try JSON first
            const parsed = JSON.parse(data.images);
            if (Array.isArray(parsed)) {
              images = parsed.filter(url => typeof url === 'string' && url.startsWith('http'));
            }
          } catch {
            // Try Postgres literal format: {url1,url2}
            const match = data.images.match(/^\{(.*)\}$/);
            if (match) {
              images = match[1]
                .split(',')
                .map(s => s.trim().replace(/"/g, ''))
                .filter(url => url.startsWith('http'));
            }
          }
        }

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
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "";
    return parsedDate.toLocaleDateString("en-IN", {
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
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 className="task-title">{task.title}</h2>

      {task.deadline && (
        <p className="task-deadline">Deadline: {formatDate(task.deadline)}</p>
      )}

      {task.description && <p className="task-desc">{task.description}</p>}

      {task.bullets.length > 0 && (
        <ul className="task-bullets">
          {task.bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}

      {task.images.length > 0 && (
        <div className="image-grid">
          {task.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Task image ${index + 1}`}
              className="task-image"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}