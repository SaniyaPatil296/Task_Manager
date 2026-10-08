import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { api } from "../services/api";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [token, setToken] = useState(
    () => localStorage.getItem("task_token")
  );

  const [user, setUser] = useState(() => {

    const saved =
      localStorage.getItem("task_user");

    return saved
      ? JSON.parse(saved)
      : null;
  });

  const [loading, setLoading] = useState(false);


  useEffect(() => {

    if (token && !user) {

      setLoading(true);

      api.profile()

        .then((profile) => {

          setUser(profile);

          localStorage.setItem(
            "task_user",
            JSON.stringify(profile)
          );

        })

        .catch(() => {

          localStorage.removeItem("task_token");
          localStorage.removeItem("task_user");

          setToken(null);
          setUser(null);

        })

        .finally(() => {

          setLoading(false);

        });
    }

  }, [token, user]);


  async function login(username, password) {

    const data = await api.login({
      username,
      password
    });

    localStorage.setItem(
      "task_token",
      data.token
    );

    localStorage.setItem(
      "task_user",
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);

    return data;
  }


  async function register(data) {

    const result =
      await api.register(data);

    localStorage.setItem(
      "task_token",
      result.token
    );

    localStorage.setItem(
      "task_user",
      JSON.stringify(result.user)
    );

    setToken(result.token);
    setUser(result.user);

    return result;
  }


  async function logout() {

    try {

      if (token) {
        await api.logout();
      }

    } catch {

      // Clear local session anyway.

    } finally {

      localStorage.removeItem("task_token");
      localStorage.removeItem("task_user");

      setToken(null);
      setUser(null);

    }
  }


  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  return useContext(AuthContext);

}