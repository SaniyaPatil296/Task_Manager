import {
  useEffect,
  useMemo,
  useState
} from "react";

import { Link } from "react-router-dom";

import { api } from "../services/api";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import TaskCard from "../components/TaskCard";


export default function Tasks() {

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const [search, setSearch] =
    useState("");


  async function loadTasks() {

    try {

      setLoading(true);

      setError("");

      const data =
        await api.getTasks({
          status,
          priority,
          search
        });


      setTasks(
        Array.isArray(data)
          ? data
          : data.results || []
      );

    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadTasks();

  }, [status, priority]);


  const filteredTasks =
    useMemo(() => {

      if (!search.trim()) {
        return tasks;
      }

      const term =
        search.toLowerCase();

      return tasks.filter(
        (task) =>

          task.title
            .toLowerCase()
            .includes(term)

          ||

          (task.description || "")
            .toLowerCase()
            .includes(term)
      );

    }, [tasks, search]);


  async function handleDelete(id) {

    if (
      !window.confirm(
        "Are you sure you want to delete this task?"
      )
    ) {
      return;
    }


    try {

      await api.deleteTask(id);

      setTasks(
        current =>
          current.filter(
            task => task.id !== id
          )
      );

    } catch (error) {

      setError(error.message);

    }
  }


  return (

    <section>

      <div className="page-header">

        <div>

          <p className="eyebrow">
            Your workspace
          </p>

          <h1>
            My Tasks
          </h1>

          <p className="muted">
            Create, update and track
            your work.
          </p>

        </div>


        <Link
          className="btn btn-primary"
          to="/tasks/create"
        >
          + Add Task
        </Link>

      </div>


      <div className="filters">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search tasks..."
        />


        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >

          <option value="">
            All statuses
          </option>

          <option value="TODO">
            To Do
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="DONE">
            Done
          </option>

        </select>


        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
        >

          <option value="">
            All priorities
          </option>

          <option value="LOW">
            Low
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="HIGH">
            High
          </option>

        </select>


        <button
          className="btn btn-secondary"
          onClick={loadTasks}
        >
          Refresh
        </button>

      </div>


      {loading && (

        <Loading
          text="Loading your tasks..."
        />

      )}


      {!loading && (

        <ErrorMessage
          message={error}
          onRetry={loadTasks}
        />

      )}


      {!loading &&
        !error && (

          <>

            <p className="result-count">

              {filteredTasks.length}

              {" "}

              task
              {filteredTasks.length !== 1
                ? "s"
                : ""}

            </p>


            {filteredTasks.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ✓
                </div>

                <h2>
                  No tasks found
                </h2>

                <p>
                  Create your first task
                  or change your filters.
                </p>

                <Link
                  className="btn btn-primary"
                  to="/tasks/create"
                >
                  Create Task
                </Link>

              </div>

            ) : (

              <div className="task-grid">

                {filteredTasks.map(
                  task => (

                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDelete}
                    />

                  )
                )}

              </div>

            )}

          </>

        )}

    </section>
  );
}