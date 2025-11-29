import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Alumnos from "./pages/Alumnos";
import ClasesPage from "./pages/ClasesPage";
import ClaseDetalle from "./pages/ClaseDetalle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/alumnos" element={<Alumnos />} />
        <Route path="/clases" element={<ClasesPage />} />
        <Route path="/clases/:id" element={<ClaseDetalle />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
