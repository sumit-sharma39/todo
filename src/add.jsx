import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./add.css";
import {BASE_URL_BACKEND } from "./config";

export function Add({ setTasks }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bulletInput, setBulletInput] = useState("");
  const [bullets, setBullets] = useState([]);
  const [images, setImages] = useState([]);
  const [deadline, setDeadline] = useState("");

  const navigate = useNavigate();

  function addBullet() {
    if (!bulletInput.trim()) return;
    setBullets((prev) => [...prev, bulletInput]);
    setBulletInput("");
  }

  async function saveTask() {
    if (!title.trim()) return;

    try {
      // only for saving the data of the task 
    const response = await axios.post(`${BASE_URL_BACKEND}/add`, {
        title,
        description,
        bullets,
        deadline,
        completed: false,
      });

      //here goes the cloudinary imae url 
      const savedTask = response.data;
      // console.log("savetaskkkkkkkkkkk : ",saveTask);
      let uploadedImages = [];
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((img) => formData.append("image_url", img));
        const imgResponse = await axios.post(
          `${BASE_URL_BACKEND}/todo/${savedTask.id}/image_url`,
          formData
        );

        uploadedImages = imgResponse.data.images || [];
      }
      setTasks((prev) => [
        ...prev,
        { ...savedTask, images: uploadedImages },
      ]);

      navigate("/");
    } catch (err) {
      console.error("Error saving task:", err);
    }
  }

  return (
    <div className="AddPage">
      <h2>Add New Task</h2>

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
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        }}
      />

      {images.length > 0 && (
        <div className="image-preview">
          {images.map((img, i) => (
            <img key={i} src={URL.createObjectURL(img)} alt="preview" />
          ))}
        </div>
      )}

      <button className="save-btn" onClick={saveTask}>
        Save Task
      </button>
    </div>
  );
}
