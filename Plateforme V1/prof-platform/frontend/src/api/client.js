import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : "/api");

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(
      localStorage.getItem("teacher_session") || "null",
    );
    if (session?.id) config.headers["X-Teacher-Id"] = String(session.id);
  } catch {
    // Une session absente sera traitée par l'écran de connexion.
  }
  return config;
});

export default client;
