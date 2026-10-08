import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function Login() {

  const { login } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();


  const [form, setForm] = useState({
    username: "",
    password: ""
  });


  const [errors, setErrors] = useState({});

  const [serverError, setServerError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  function validate() {

    const errors = {};

    if (!form.username.trim()) {
      errors.username =
        "Username is required.";
    }

    if (!form.password) {
      errors.password =
        "Password is required.";
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

      await login(
        form.username.trim(),
        form.password
      );


      const destination =
        location.state?.from?.pathname ||
        "/tasks";

      navigate(destination, {
        replace: true
      });

    } catch (error) {

      setServerError(error.message);

    } finally {

      setSubmitting(false);

    }
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
            Welcome back
          </p>

          <h1>Login</h1>

          <p>
            Sign in to manage your tasks.
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
              setForm({
                ...form,
                username: e.target.value
              })
            }
            placeholder="Enter username"
          />

          {errors.username && (

            <small className="field-error">
              {errors.username}
            </small>

          )}

        </label>


        <label>

          Password

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            placeholder="Enter password"
          />

          {errors.password && (

            <small className="field-error">
              {errors.password}
            </small>

          )}

        </label>


        <button
          className="btn btn-primary full-width"
          disabled={submitting}
        >
          {submitting
            ? "Signing in..."
            : "Login"}
        </button>


        <p className="form-footer">

          Don't have an account?

          {" "}

          <Link to="/register">
            Create one
          </Link>

        </p>

      </form>

    </section>
  );
}