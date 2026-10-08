import {
  useEffect,
  useState
} from "react";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";


export default function Profile() {

  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState(() => {
    if (authUser) return authUser;
    try {
      const saved = localStorage.getItem("task_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => !profile);


  async function loadProfile() {

    try {

      const data = await api.profile();

      if (data) {
        setProfile(data);

        localStorage.setItem(
          "task_user",
          JSON.stringify(data)
        );
      }

    } catch (err) {

      // Silently fall back to cached user profile so errors do not display on frontend
      console.warn("Could not refresh profile from server:", err);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadProfile();

  }, []);


  if (loading && !profile) {

    return (
      <Loading
        text="Loading profile..."
      />
    );

  }


  const displayUser = profile || authUser || {};

  function formatMemberSince(dateStr) {
    if (!dateStr) return "Active member";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "Active member" : d.toLocaleDateString();
    } catch {
      return "Active member";
    }
  }


  return (

    <section className="profile-page">

      <div className="page-header">

        <div>

          <p className="eyebrow">
            Account
          </p>

          <h1>
            My Profile
          </h1>

        </div>

      </div>


      <div className="profile-card">

        <div className="avatar">

          {displayUser.username
            ?.charAt(0)
            .toUpperCase() || "U"}

        </div>


        <h2>
          {displayUser.username || "User"}
        </h2>


        <p>
          {displayUser.email || ""}
        </p>


        <div className="profile-info">

          <div>

            <span>
              Username
            </span>

            <strong>
              {displayUser.username || "—"}
            </strong>

          </div>


          <div>

            <span>
              Email
            </span>

            <strong>
              {displayUser.email || "—"}
            </strong>

          </div>


          <div>

            <span>
              Member since
            </span>

            <strong>
              {formatMemberSince(displayUser.date_joined)}
            </strong>

          </div>

        </div>

      </div>

    </section>
  );
}