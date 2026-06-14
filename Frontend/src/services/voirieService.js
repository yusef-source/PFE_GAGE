import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const getVoirie = () => {
  return axios.get(`${API_URL}/voirie`);
};