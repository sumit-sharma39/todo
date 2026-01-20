import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./taskdetail.css";
import {BASE_URL} from "./config";

export function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/todo/${id}`)
      .then(res => {
        const t = res.data || {};

        let bullets = [];
        if (Array.isArray(t.bullets)) bullets = t.bullets;
        else if (typeof t.bullets === "string") {
          try {
            bullets = JSON.parse(t.bullets) || [];
          } catch {
            bullets = [];
          }
        }

        const images = Array.isArray(t.images) ? t.images : [];

        setTask({
          title: t.title || "Untitled Task",
          description: t.description || "",
          deadline: t.deadline || "",
          bullets,
          images,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching task:", err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const formatDate = date => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading task. Try again later.</p>;

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
          {task.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      {task.images.length > 0 && (
        <div className="image-grid">
          {task.images.map((img, i) => (
            <img
              key={i}
              src={`${BASE_URL}${img}`}
              alt={`task-img-${i}`}
              className="task-image"
            />
          ))}
        </div>
      )}
    </div>
  );
}
