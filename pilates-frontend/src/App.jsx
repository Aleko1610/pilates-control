import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Alumnos from "./pages/Alumnos";
import ClasesPage from "./pages/ClasesPage";
import ClaseDetalle from "./pages/ClaseDetalle";

function App() {
  return (
    <BrowserRouter>
      <Sidebar />

      <div style={{ marginLeft: "240px", padding: "20px" }}>
        <Routes>
          <Route path="/" element={<ClasesPage />} />
          <Route path="/clases" element={<ClasesPage />} />
          <Route path="/clases/:id" element={<ClaseDetalle />} />
          <Route path="/alumnos" element={<Alumnos />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
