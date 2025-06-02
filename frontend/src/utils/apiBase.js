const isLocal = window.location.hostname === "localhost";

export const API_BASE = isLocal  ? "http://localhost:8080"  : process.env.REACT_APP_API_BASE;
