import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MapView from "./components/map/MapView";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/platform" element={<MapView />} />

        {/* Ancienne route redirigée vers la nouvelle */}
        <Route path="/map" element={<Navigate to="/platform" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;