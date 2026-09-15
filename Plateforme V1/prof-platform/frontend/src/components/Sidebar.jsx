import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Tableau de bord", end: true },
  { to: "/teachers", label: "Enseignants" },
  { to: "/classes", label: "Classes" },
  { to: "/cours", label: "Cours" },
  { to: "/activites", label: "Activités" },
  { to: "/competences", label: "Compétences" },
  { to: "/evaluations", label: "Évaluations" },
  { to: "/progression", label: "Progression" },
  { to: "/planning", label: "Planning" },
  { to: "/messages", label: "Messagerie" },
];

const COURS_EN_LIGNE_URL = "https://adrielsimo12.github.io/Education/cours/";

export default function Sidebar() {
  let teacherName = "Enseignant";
  try {
    const session = JSON.parse(localStorage.getItem("teacher_session") || "null");
    teacherName = session?.nom || session?.username || teacherName;
  } catch {
    // La session invalide est gérée par l'application principale.
  }

  const logout = () => {
    localStorage.removeItem("teacher_session");
    window.location.reload();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="tick"></span> CAHIER DE TEXTE
      </div>
      <div className="sidebar-teacher-name">{teacherName}</div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            {l.label}
          </NavLink>
        ))}
        <a href={COURS_EN_LIGNE_URL} target="_blank" rel="noopener noreferrer">
          Cours en ligne ↗
        </a>
      </nav>
      <button type="button" className="btn btn-sm" onClick={logout} style={{ margin: "16px 16px 0" }}>
        Déconnexion
      </button>
      <div className="sidebar-foot">
        v1.0 · local
        <br />
        Adriel Simo © 2026
      </div>
    </aside>
  );
}
