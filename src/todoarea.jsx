import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./todo.css";
import { Dashboard } from "./dashboard";
import { BASE_URL } from "./config";

export function TodoArea() {
  const [tasks, setTasks] = useState([]);
  const [multiDeleteMode, setMultiDeleteMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/data`)
      .then((res) => {
        console.log("RAW API RESPONSE", res.data);

        const tasksArray = Array.isArray(res.data) ? res.data : res.data.data || [];

        const formatted = tasksArray.map((task) => {
          // Parse bullets
          let bullets = [];
          if (Array.isArray(task.bullets)) {
            bullets = task.bullets;
          } else if (typeof task.bullets === "string") {
            try {
              bullets = JSON.parse(task.bullets);
            } catch {
              // Handle Postgres array literal: "{item1,item2}"
              if (task.bullets.startsWith("{") && task.bullets.endsWith("}")) {
                bullets = task.bullets
                  .slice(1, -1)
                  .split(",")
                  .map((s) => s.trim().replace(/"/g, ""));
              } else {
                bullets = task.bullets ? [task.bullets] : [];
              }
            }
          }

          // Parse images
          let images = [];
          if (Array.isArray(task.images)) {
            images = task.images.filter(url => typeof url === 'string' && url.trim().startsWith('http'));
          } else if (typeof task.images === "string") {
            // Handle Postgres array literal: "{url1,url2}"
            if (task.images.startsWith("{") && task.images.endsWith("}")) {
              images = task.images
                .slice(1, -1)
                .split(",")
                .map((s) => s.trim().replace(/"/g, ""))
                .filter(url => url.startsWith('http'));
            }
          }

          return {
            ...task,
            id: task.id || task._id,
            bullets,
            images,
            deadline: task.deadline || null,
          };
        });

        console.log("FORMATTED TASKS", formatted);
        setTasks(formatted);
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        setTasks([]);
      });
  }, []);

  const toggleMultiDeleteMode = () => {
    setMultiDeleteMode(true);
    setSelectedTasks([]);
  };

  const cancelMultiDeleteMode = () => {
    setMultiDeleteMode(false);
    setSelectedTasks([]);
  };

  const toggleSelectTask = (id) => {
    setSelectedTasks((prev) =>
      prev.includes(id)
        ? prev.filter((taskId) => taskId !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedTasks = () => {
    if (selectedTasks.length === 0) {
      alert("Select at least one task to delete!");
      return;
    }

    axios
      .post(
        `${BASE_URL}/delete`,
        { ids: selectedTasks },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      )
      .then(() => {
        setTasks((prev) =>
          prev.filter((task) => !selectedTasks.includes(task.id))
        );
        setSelectedTasks([]);
        setMultiDeleteMode(false);
      })
      .catch((err) => console.error("Error deleting tasks:", err));
  };

  const updateTaskStatus = async (id) => {
    try {
      await axios.put(
        `${BASE_URL}/todo/status`,
        { id },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: true } : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (deadline, completed) =>
    deadline && !completed && new Date(deadline) < new Date();

  const openTaskDetail = (id) => {
    navigate(`/task/${id}`);
  };

  return (
    <div>
      <Dashboard
        multiDeleteMode={multiDeleteMode}
        onDeleteClick={toggleMultiDeleteMode}
        onDeleteSelected={deleteSelectedTasks}
        onCancel={cancelMultiDeleteMode}
      />

      <div className="TodoGrid">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`TodoCard ${task.completed ? "completed" : ""} ${
              selectedTasks.includes(task.id) ? "selected" : ""
            }`}
            onClick={() => {
              if (!multiDeleteMode) openTaskDetail(task.id);
            }}
          >
            <div className="task-top">
              {multiDeleteMode && (
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelectTask(task.id)}
                />
              )}

              <h3>{task.title}</h3>

              {task.deadline && (
                <p
                  className={`task-deadline ${
                    isOverdue(task.deadline, task.completed) ? "overdue" : ""
                  }`}
                >
                  Deadline: <strong>{formatDate(task.deadline)}</strong>
                </p>
              )}
            </div>

            {task.description && <p className="task-desc">{task.description}</p>}

            {task.bullets?.length > 0 && (
              <ul className="task-bullets">
                {task.bullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            )}

            {/* ✅ Render image thumbnails */}
            {task.images && task.images.length > 0 && (
              <div className="task-images-preview">
                {task.images.slice(0, 3).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="task-image-thumb"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ))}
              </div>
            )}

            <button
              className="complete-btn"
              disabled={task.completed}
              onClick={(e) => {
                e.stopPropagation();
                updateTaskStatus(task.id);
              }}
            >
              {task.completed ? "Completed ✅" : "Mark as Completed"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}