import { useState } from "react";

export function EditTodo({ task, onSave, onCancel }) {
  const [value, setValue] = useState(task.title);

  function handleSave() {
    onSave(task.id, value);
  }

  return (
    <div className="EditBox">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button onClick={handleSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
