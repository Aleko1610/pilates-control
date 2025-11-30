import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Alumnos from "./pages/Alumnos";
import ClasesPage from "./pages/ClasesPage";
import ClaseDetalle from "./pages/ClaseDetalle";
import Planes from "./pages/Planes";
import AlumnoDetalle from "./pages/AlumnoDetalle";
import PlanesPage from "./pages/PlanesPage";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <Sidebar />

      <div style={{ marginLeft: "240px", padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clases" element={<ClasesPage />} />
          <Route path="/clases/:id" element={<ClaseDetalle />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/alumnos/:id" element={<AlumnoDetalle />} />
          <Route path="/planes" element={<PlanesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
