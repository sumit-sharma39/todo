import "./index.css";
import addIcon from "./assets/add-icon.png";
//import editIcon from "./assets/edit-icon.png"; // optional
import { Link } from "react-router-dom";

export function Dashboard({
    multiDeleteMode,
    onDeleteClick,
    onDeleteSelected,
    onCancel,
}) {
    return (
        <div className="Dashboard">
            <h1>To-do list</h1>

            <div className="dashboard-buttons">
                {/* ADD BUTTON */}
                <Link to="/add" className="edit-btn link-add">
                    Add
                    <img src={addIcon} alt="add icon" className="Add-icon" />
                </Link>

                {/* CANCEL BUTTON */}
                {multiDeleteMode && (
                    <button
                        className="edit-btn cancel-btn"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}

                {/* DELETE BUTTON */}
                <button
                    className="edit-btn delete-btn"
                    onClick={multiDeleteMode ? onDeleteSelected : onDeleteClick}
                >
                    {multiDeleteMode ? "Delete Selected" : "Delete"}
                </button>
            </div>
        </div>
    );
}
