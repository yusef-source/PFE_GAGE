import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const getEquipements = () => {
  return axios.get(`${API_URL}/equipements`);
};