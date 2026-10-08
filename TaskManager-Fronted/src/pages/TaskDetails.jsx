import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import { api } from "../services/api";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";


const statusLabels = {

  TODO: "To Do",

  IN_PROGRESS: "In Progress",

  DONE: "Done"

};


export default function TaskDetails() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [task, setTask] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadTask() {

    try {

      setLoading(true);

      setError("");

      const data =
        await api.getTask(id);

      setTask(data);

    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadTask();

  }, [id]);


  async function handleDelete() {

    if (
      !window.confirm(
        "Delete this task permanently?"
      )
    ) {
      return;
    }


    try {

      await api.deleteTask(id);

      navigate("/tasks");

    } catch (error) {

      setError(error.message);

    }
  }


  if (loading) {

    return (
      <Loading text="Loading task..." />
    );

  }


  return (

    <section className="detail-page">

      <Link
        to="/tasks"
        className="back-link"
      >
        ← Back to tasks
      </Link>


      <ErrorMessage
        message={error}
        onRetry={loadTask}
      />


      {task && !error && (

        <article className="detail-card">

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


          <h1>
            {task.title}
          </h1>


          <p className="detail-description">

            {task.description ||
              "No description provided."}

          </p>


          <div className="detail-grid">

            <div>

              <span className="detail-label">
                Owner
              </span>

              <strong>
                {task.owner ||
                  "Current user"}
              </strong>

            </div>


            <div>

              <span className="detail-label">
                Due date
              </span>

              <strong>
                {task.due_date ||
                  "Not set"}
              </strong>

            </div>


            <div>

              <span className="detail-label">
                Created
              </span>

              <strong>
                {task.created_at
                  ? new Date(
                      task.created_at
                    ).toLocaleString()
                  : "Not available"}
              </strong>

            </div>


            <div>

              <span className="detail-label">
                Updated
              </span>

              <strong>
                {task.updated_at
                  ? new Date(
                      task.updated_at
                    ).toLocaleString()
                  : "Not available"}
              </strong>

            </div>

          </div>


          <div className="card-actions">

            <Link
              className="btn btn-primary"
              to={`/tasks/${task.id}/edit`}
            >
              Edit Task
            </Link>


            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete Task
            </button>

          </div>

        </article>

      )}

    </section>
  );
}