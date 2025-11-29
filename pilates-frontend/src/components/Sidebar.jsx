import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>PilatesControl</h2>

      <nav style={styles.menu}>
        <NavLink to="/clases" style={styles.link}>📅 Clases</NavLink>
        <NavLink to="/alumnos" style={styles.link}>👤 Alumnos</NavLink>
        <NavLink to="/planes" style={styles.link}>💳 Planes</NavLink>
        <NavLink to="/dashboard" style={styles.link}>📊 Dashboard</NavLink>
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "240px",
    background: "#181818",
    color: "#fff",
    height: "100vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #333",
    position: "fixed",
    top: 0,
    left: 0
  },
  logo: {
    fontSize: "24px",
    marginBottom: "30px"
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  link: {
    textDecoration: "none",
    color: "#ddd",
    fontSize: "16px",
    padding: "10px 12px",
    borderRadius: "8px"
  }
};

export default Sidebar;
