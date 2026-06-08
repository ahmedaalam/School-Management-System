import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function useApi() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const authAxios = {
    get: (url) =>
      axios.get(url, { headers: { Authorization: `Bearer ${token}` } }),
    post: (url, data) =>
      axios.post(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    put: (url, data) =>
      axios.put(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    delete: (url) =>
      axios.delete(url, { headers: { Authorization: `Bearer ${token}` } }),
  };

  axios.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401) { logout(); navigate("/login"); }
      return Promise.reject(err);
    }
  );

  return authAxios;
}
