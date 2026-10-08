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


const initialForm = {

  title: "",

  description: "",

  status: "TODO",

  priority: "MEDIUM",

  due_date: ""

};


export default function TaskForm() {

  const { id } = useParams();

  const isEdit = Boolean(id);

  const navigate = useNavigate();


  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(isEdit);

  const [submitting, setSubmitting] =
    useState(false);


  useEffect(() => {

    if (!isEdit) {
      return;
    }


    async function load() {

      try {

        const task =
          await api.getTask(id);


        setForm({

          title: task.title || "",

          description:
            task.description || "",

          status:
            task.status || "TODO",

          priority:
            task.priority || "MEDIUM",

          due_date:
            task.due_date || ""

        });

      } catch (error) {

        setServerError(
          error.message
        );

      } finally {

        setLoading(false);

      }
    }


    load();

  }, [id, isEdit]);


  function validate() {

    const errors = {};


    if (!form.title.trim()) {

      errors.title =
        "Title is required.";

    } else if (
      form.title.trim().length < 3
    ) {

      errors.title =
        "Title must be at least 3 characters.";

    }


    if (
      !["TODO", "IN_PROGRESS", "DONE"]
        .includes(form.status)
    ) {

      errors.status =
        "Select a valid status.";

    }


    if (
      !["LOW", "MEDIUM", "HIGH"]
        .includes(form.priority)
    ) {

      errors.priority =
        "Select a valid priority.";

    }


    return errors;
  }


  function update(name, value) {

    setForm(old => ({
      ...old,
      [name]: value
    }));


    setErrors(old => ({
      ...old,
      [name]: ""
    }));

  }


  async function handleSubmit(event) {

    event.preventDefault();

    setServerError("");

    const validation = validate();

    setErrors(validation);


    if (Object.keys(validation).length) {
      return;
    }


    try {

      setSubmitting(true);


      const payload = {

        title:
          form.title.trim(),

        description:
          form.description.trim(),

        status:
          form.status,

        priority:
          form.priority,

        due_date:
          form.due_date || null

      };


      if (isEdit) {

        await api.updateTask(
          id,
          payload
        );

        navigate(`/tasks/${id}`);

      } else {

        const created =
          await api.createTask(
            payload
          );

        navigate(
          `/tasks/${created.id}`
        );

      }

    } catch (error) {

      setServerError(
        error.message
      );

    } finally {

      setSubmitting(false);

    }
  }


  if (loading) {

    return (
      <Loading
        text="Loading task..."
      />
    );

  }


  return (

    <section className="form-page">

      <Link
        to={
          isEdit
            ? `/tasks/${id}`
            : "/tasks"
        }
        className="back-link"
      >
        ← Back
      </Link>


      <form
        className="large-form-card"
        onSubmit={handleSubmit}
        noValidate
      >

        <div className="form-heading">

          <p className="eyebrow">

            {isEdit
              ? "Update task"
              : "New task"}

          </p>


          <h1>

            {isEdit
              ? "Edit Task"
              : "Create Task"}

          </h1>


          <p>

            {isEdit
              ? "Update your task information."
              : "Add a task to your workspace."}

          </p>

        </div>


        {serverError && (

          <div className="inline-error">
            {serverError}
          </div>

        )}


        <label>

          Title *

          <input
            value={form.title}
            onChange={(e) =>
              update(
                "title",
                e.target.value
              )
            }
            placeholder="Enter task title"
          />

          {errors.title && (

            <small className="field-error">
              {errors.title}
            </small>

          )}

        </label>


        <label>

          Description

          <textarea
            rows="5"
            value={form.description}
            onChange={(e) =>
              update(
                "description",
                e.target.value
              )
            }
            placeholder="Describe the task..."
          />

        </label>


        <div className="two-column">

          <label>

            Status *

            <select
              value={form.status}
              onChange={(e) =>
                update(
                  "status",
                  e.target.value
                )
              }
            >

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

          </label>


          <label>

            Priority *

            <select
              value={form.priority}
              onChange={(e) =>
                update(
                  "priority",
                  e.target.value
                )
              }
            >

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

          </label>

        </div>


        <label>

          Due Date

          <input
            type="date"
            value={form.due_date || ""}
            onChange={(e) =>
              update(
                "due_date",
                e.target.value
              )
            }
          />

        </label>


        <div className="form-actions">

          <Link
            className="btn btn-secondary"
            to={
              isEdit
                ? `/tasks/${id}`
                : "/tasks"
            }
          >
            Cancel
          </Link>


          <button
            className="btn btn-primary"
            disabled={submitting}
          >

            {submitting
              ? "Saving..."
              : isEdit
                ? "Update Task"
                : "Create Task"}

          </button>

        </div>

      </form>

    </section>
  );
}