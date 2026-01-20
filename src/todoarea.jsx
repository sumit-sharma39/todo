import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./todo.css";
import { Dashboard } from "./dashboard";
import { BASE_URL } from "./config";

/**
 * React component for the main todo area.
 * - Fetches tasks from the backend on load.
 * - Displays tasks in a grid with options to mark complete, multi-delete, or view details.
 * - Handles state for tasks, multi-delete mode, and selected tasks.
 */
export function TodoArea() {
  // State variables (React's way to store and update data)
  const [tasks, setTasks] = useState([]);  // List of tasks from the backend
  const [multiDeleteMode, setMultiDeleteMode] = useState(false);  // True when selecting multiple tasks to delete
  const [selectedTasks, setSelectedTasks] = useState([]);  // IDs of selected tasks for deletion
  const navigate = useNavigate();  // Hook for navigating to other pages (e.g., task details)

  // Fetch tasks when the component loads (runs once on mount)
  useEffect(() => {
    axios
      .get(`${BASE_URL}/data`)  // API call to get tasks
      .then(res => {
        // Format the response: parse bullets (assumed to be JSON string from DB) and handle missing deadline
        const formatted = res.data.map(task => ({
          ...task,
          bullets: (() => {
            try {
              // Try to parse bullets as JSON; fallback to empty array if invalid
              return typeof task.bullets === "string" ? JSON.parse(task.bullets) : task.bullets || [];
            } catch {
              return [];  // Safety: return empty array on parse error
            }
          })(),
          deadline: task.deadline || null  // Ensure deadline is null if missing
        }));
        setTasks(formatted);  // Update state with formatted tasks
      })
      .catch(err => console.error("Error fetching tasks:", err));  // Log errors
  }, []);  // Empty dependency array: run only once

  // Toggle multi-delete mode on
  const toggleMultiDeleteMode = () => {
    setMultiDeleteMode(true);
    setSelectedTasks([]);  // Clear any selections
  };

  // Cancel multi-delete mode
  const cancelMultiDeleteMode = () => {
    setMultiDeleteMode(false);
    setSelectedTasks([]);  // Clear selections
  };

  // Toggle selection of a task for deletion
  const toggleSelectTask = (id) => {
    setSelectedTasks(prev =>
      prev.includes(id)
        ? prev.filter(taskId => taskId !== id)  // Remove if already selected
        : [...prev, id]  // Add if not selected
    );
  };

  // Delete selected tasks
  const deleteSelectedTasks = () => {
    if (selectedTasks.length === 0) {
      alert("Select at least one task to delete!");
      return;
    }

    axios
      .post(`${BASE_URL}/delete`, { ids: selectedTasks })  // API call to delete
      .then(() => {
        // Update state: remove deleted tasks
        setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
        setSelectedTasks([]);
        setMultiDeleteMode(false);
      })
      .catch(err => console.error("Error deleting tasks:", err));
  };

  // Mark a task as completed
  const updateTaskStatus = async (id) => {
    try {
      await axios.put(`${BASE_URL}/todo/status`, { id });  // API call to update status
      // Update state: mark the task as completed
      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, completed: true } : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Format a date for display (e.g., "15 Jan 2023")
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";  // Invalid date check
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Check if a task is overdue (past deadline and not completed)
  const isOverdue = (deadline, completed) =>
    deadline && !completed && new Date(deadline) < new Date();

  // Navigate to the task detail page
  const openTaskDetail = (id) => {
    navigate(`/task/${id}`);
  };

  return (
    <div>
      {/* Dashboard component for delete controls */}
      <Dashboard
        multiDeleteMode={multiDeleteMode}
        onDeleteClick={toggleMultiDeleteMode}
        onDeleteSelected={deleteSelectedTasks}
        onCancel={cancelMultiDeleteMode}
      />

      {/* Grid of task cards */}
      <div className="TodoGrid">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`TodoCard ${task.completed ? "completed" : ""} ${selectedTasks.includes(task.id) ? "selected" : ""}`}
            onClick={() => {
              // Only navigate to details if not in multi-delete mode
              if (!multiDeleteMode) openTaskDetail(task.id);
            }}
          >
            <div className="task-top">
              {/* Checkbox for multi-delete mode */}
              {multiDeleteMode && (
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onClick={(e) => e.stopPropagation()}  // Prevent triggering card click
                  onChange={() => toggleSelectTask(task.id)}
                />
              )}

              <h3>{task.title}</h3>

              {/* Deadline display with overdue styling */}
              {task.deadline && (
                <p className={`task-deadline ${isOverdue(task.deadline, task.completed) ? "overdue" : ""}`}>
                  Deadline: <strong>{formatDate(task.deadline)}</strong>
                </p>
              )}
            </div>

            {/* Task description */}
            {task.description && <p className="task-desc">{task.description}</p>}

            {/* Bullet points (if any) */}
            {task.bullets && task.bullets.length > 0 && (
              <ul className="task-bullets">
                {task.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
              </ul>
            )}

            {/* Button to mark as completed */}
            <button
              className="complete-btn"
              disabled={task.completed}
              onClick={(e) => {
                e.stopPropagation();  // Prevent triggering card click
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