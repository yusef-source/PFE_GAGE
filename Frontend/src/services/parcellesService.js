import axios from "axios";

const API_URL = "http://localhost:3001/api/parcelles";

export const getParcelles = () => {
  return axios.get(API_URL);
};

export const getParcelleAtPoint = (lat, lng) => {
  return axios.get(`${API_URL}/at-point`, {
    params: { lat, lng },
  });
};