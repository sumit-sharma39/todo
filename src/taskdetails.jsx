import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./taskdetail.css";
import { BASE_URL } from "./config";
import {HOST_URL} from "./config"

export function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ---------- Fetch task ----------
  useEffect(() => {
    async function fetchTask() {
      try {
        const response = await axios.get(`${BASE_URL}/todo/${id}`);
        const data = response.data;

        let bullets = [];

        if (typeof data.bullets === "string") {
          try {
            bullets = JSON.parse(data.bullets);
          } catch {
            bullets = [];
          }
        } else if (Array.isArray(data.bullets)) {
          bullets = data.bullets;
        }

        // ---------- Handle images safely ----------
        const images = Array.isArray(data.images) ? data.images : [];

        // ---------- Final task object ----------
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

  // ---------- Date formatter ----------
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

  // ---------- UI states ----------
  if (loading) return <p>Loading task...</p>;
  if (error) return <p>Unable to load task.</p>;
  if (!task) return null;

  // ---------- UI ----------
  return (
    <div className="TaskDetailPage">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

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
              src={`${BASE_URL}${img}`}
              alt="task"
              className="task-image"
            />
          ))}
        </div>
      )}
    </div>
  );
}
