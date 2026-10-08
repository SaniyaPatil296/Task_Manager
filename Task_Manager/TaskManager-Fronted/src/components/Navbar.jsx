import {
  Link,
  NavLink,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function Navbar() {

  const {
    isAuthenticated,
    user,
    logout
  } = useAuth();

  const navigate = useNavigate();


  async function handleLogout() {

    await logout();

    navigate("/login");

  }


  return (

    <header className="navbar">

      <div className="nav-inner">

        <Link
          to={isAuthenticated ? "/tasks" : "/login"}
          className="brand"
        >
          Task<span>Manager</span>
        </Link>


        <nav className="nav-links">

          {isAuthenticated ? (

            <>

              <NavLink to="/tasks">
                Tasks
              </NavLink>

              <NavLink to="/tasks/create">
                Add Task
              </NavLink>

              <NavLink to="/profile">
                Profile
              </NavLink>

              <span className="welcome">
                Hi, {user?.username}
              </span>

              <button
                className="btn btn-small btn-outline"
                onClick={handleLogout}
              >
                Logout
              </button>

            </>

          ) : (

            <>

              <NavLink to="/login">
                Login
              </NavLink>

              <NavLink to="/register">
                Register
              </NavLink>

            </>

          )}

        </nav>

      </div>

    </header>
  );
}