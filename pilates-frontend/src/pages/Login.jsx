import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Completar usuario y contraseña");
      return;
    }

    fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          // Guardar sesión si hace falta más adelante
          localStorage.setItem("token", data.token || "ok");
          navigate("/clases");
        }
      })
      .catch(() => setError("Error en el servidor"));
  };

  return (
    <div style={styles.container}>
      <h2>Ingreso</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={styles.button}>
          Entrar
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "350px",
    margin: "80px auto",
    padding: "20px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#f8f8f8",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #bbb",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Login;
