import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { TaskDetail } from './taskdetails';
import { TodoArea } from './todoarea';
import { Add } from './add';

function App() {
  const [tasks, setTasks] = useState([]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<TodoArea tasks={tasks} setTasks={setTasks} />}
        />

        <Route
          path="/Add"
          element={<Add setTasks={setTasks} />}
        />

        
        <Route path="/task/:id" element={<TaskDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
