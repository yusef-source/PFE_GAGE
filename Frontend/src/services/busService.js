import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const getBus = () => {
  return axios.get(`${API_URL}/transport/bus`);
};