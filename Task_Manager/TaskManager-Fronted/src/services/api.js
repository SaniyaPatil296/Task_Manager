function getApiBaseUrl() {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.BACKEND_URL ||
    import.meta.env.API_URL ||
    ""
  ).trim();

  if (!envUrl) {
    return "/api";
  }

  // Remove trailing slashes
  const cleanUrl = envUrl.replace(/\/+$/, "");

  // If the URL already ends with /api, use it as is; otherwise append /api
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
}

const API_BASE = getApiBaseUrl();

async function request(path, options = {}) {

  const token = localStorage.getItem("task_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  let response;

  try {

    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

  } catch (error) {

    throw new Error(
      "Cannot connect to backend. Please check your backend URL and network connection."
    );

  }

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // If response is HTML or text, do not parse as detail to avoid leaking server errors
    await response.text().catch(() => "");
    data = null;
  }

  if (!response.ok) {

    if (response.status === 401) {

      localStorage.removeItem("task_token");
      localStorage.removeItem("task_user");

    }

    let message = data?.detail || data?.message;

    if (!message && data && typeof data === "object") {
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const val = data[firstKey];
        message = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
      }
    }

    // Do not display raw HTML or internal technical errors on frontend
    if (
      !message ||
      typeof message !== "string" ||
      message.includes("<html") ||
      message.includes("<!DOCTYPE") ||
      message.includes("ImproperlyConfigured") ||
      message.includes("Traceback")
    ) {
      message =
        response.status === 401
          ? "Session expired. Please log in again."
          : response.status === 404
          ? "Resource not found."
          : response.status >= 500
          ? "Unable to complete request. Please try again."
          : `Request failed with status ${response.status}.`;
    }

    throw new Error(message);
  }

  return data;
}


export const api = {

  register: (data) =>
    request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data)
    }),


  login: (data) =>
    request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data)
    }),


  logout: () =>
    request("/auth/logout/", {
      method: "POST"
    }),


  profile: () =>
    request("/auth/profile/"),


  getTasks: (params = {}) => {

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value) {
        searchParams.set(key, value);
      }

    });

    const query = searchParams.toString();

    return request(
      `/tasks/${query ? `?${query}` : ""}`
    );
  },


  getTask: (id) =>
    request(`/tasks/${id}/`),


  createTask: (data) =>
    request("/tasks/", {
      method: "POST",
      body: JSON.stringify(data)
    }),


  updateTask: (id, data) =>
    request(`/tasks/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),


  deleteTask: (id) =>
    request(`/tasks/${id}/`, {
      method: "DELETE"
    })

};