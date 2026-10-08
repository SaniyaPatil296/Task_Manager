import { Link } from "react-router-dom";


const statusLabels = {

  TODO: "To Do",

  IN_PROGRESS: "In Progress",

  DONE: "Done"

};


export default function TaskCard({
  task,
  onDelete
}) {

  return (

    <article className="task-card">

      <div className="task-card-top">

        <span
          className={`badge status-${task.status.toLowerCase()}`}
        >
          {statusLabels[task.status] ||
            task.status}
        </span>


        <span
          className={`badge priority-${task.priority.toLowerCase()}`}
        >
          {task.priority}
        </span>

      </div>


      <h3>
        {task.title}
      </h3>


      <p className="task-description">

        {task.description ||
          "No description provided."}

      </p>


      <div className="task-meta">

        📅 {task.due_date || "No due date"}

      </div>


      <div className="card-actions">

        <Link
          className="btn btn-small"
          to={`/tasks/${task.id}`}
        >
          View
        </Link>


        <Link
          className="btn btn-small btn-secondary"
          to={`/tasks/${task.id}/edit`}
        >
          Edit
        </Link>


        <button
          className="btn btn-small btn-danger"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>

      </div>

    </article>
  );
}