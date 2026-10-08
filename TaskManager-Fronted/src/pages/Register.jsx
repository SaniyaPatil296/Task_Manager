import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function Register() {

  const { register } = useAuth();

  const navigate = useNavigate();


  const [form, setForm] = useState({

    username: "",

    email: "",

    password: "",

    password_confirm: ""

  });


  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  function validate() {

    const errors = {};


    if (!form.username.trim()) {

      errors.username =
        "Username is required.";

    } else if (
      form.username.trim().length < 3
    ) {

      errors.username =
        "Username must be at least 3 characters.";

    }


    if (!form.email.trim()) {

      errors.email =
        "Email is required.";

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {

      errors.email =
        "Enter a valid email address.";

    }


    if (!form.password) {

      errors.password =
        "Password is required.";

    } else if (
      form.password.length < 8
    ) {

      errors.password =
        "Password must be at least 8 characters.";

    }


    if (!form.password_confirm) {

      errors.password_confirm =
        "Please confirm your password.";

    } else if (
      form.password !==
      form.password_confirm
    ) {

      errors.password_confirm =
        "Passwords do not match.";

    }


    return errors;
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

      await register({

        username:
          form.username.trim(),

        email:
          form.email.trim().toLowerCase(),

        password:
          form.password,

        password_confirm:
          form.password_confirm

      });


      navigate("/tasks", {
        replace: true
      });

    } catch (error) {

      setServerError(error.message);

    } finally {

      setSubmitting(false);

    }
  }


  function update(name, value) {

    setForm((old) => ({
      ...old,
      [name]: value
    }));

  }


  return (

    <section className="auth-page">

      <form
        className="form-card"
        onSubmit={handleSubmit}
        noValidate
      >

        <div className="form-heading">

          <p className="eyebrow">
            Get started
          </p>

          <h1>
            Create account
          </h1>

          <p>
            Register and start managing
            your tasks.
          </p>

        </div>


        {serverError && (

          <div className="inline-error">
            {serverError}
          </div>

        )}


        <label>

          Username

          <input
            value={form.username}
            onChange={(e) =>
              update(
                "username",
                e.target.value
              )
            }
          />

          {errors.username && (

            <small className="field-error">
              {errors.username}
            </small>

          )}

        </label>


        <label>

          Email

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              update(
                "email",
                e.target.value
              )
            }
          />

          {errors.email && (

            <small className="field-error">
              {errors.email}
            </small>

          )}

        </label>


        <label>

          Password

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              update(
                "password",
                e.target.value
              )
            }
          />

          {errors.password && (

            <small className="field-error">
              {errors.password}
            </small>

          )}

        </label>


        <label>

          Confirm Password

          <input
            type="password"
            value={form.password_confirm}
            onChange={(e) =>
              update(
                "password_confirm",
                e.target.value
              )
            }
          />

          {errors.password_confirm && (

            <small className="field-error">
              {errors.password_confirm}
            </small>

          )}

        </label>


        <button
          className="btn btn-primary full-width"
          disabled={submitting}
        >
          {submitting
            ? "Creating account..."
            : "Register"}
        </button>


        <p className="form-footer">

          Already have an account?

          {" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </form>

    </section>
  );
}