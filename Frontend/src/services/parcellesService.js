import axios from "axios";

export const getParcelles = () => {
  return axios.get("http://localhost:3001/api/parcelles");
};