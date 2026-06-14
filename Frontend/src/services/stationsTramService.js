import axios from "axios";

export const getStationsTram = () => {
  return axios.get("http://localhost:3001/api/transport/stations-tram");
};