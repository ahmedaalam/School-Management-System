import { useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

let interceptorRegistered = false;

export default function useApi() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const logoutRef = useRef(logout);
  const navigateRef = useRef(navigate);

  logoutRef.current = logout;
  navigateRef.current = navigate;

  useEffect(() => {
    if (interceptorRegistered) return;
    axios.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err.response?.status === 401) {
          logoutRef.current();
          navigateRef.current("/login");
        }
        return Promise.reject(err);
      }
    );
    interceptorRegistered = true;
  }, []);

  return useMemo(() => ({
    get: (url) =>
      axios.get(url, { headers: { Authorization: `Bearer ${token}` } }),
    post: (url, data) =>
      axios.post(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    put: (url, data) =>
      axios.put(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    delete: (url) =>
      axios.delete(url, { headers: { Authorization: `Bearer ${token}` } }),
  }), [token]);
}
