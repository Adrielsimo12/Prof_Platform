import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { approveTeacher, createTeacher, deleteTeacher, getPendingTeachers, getTeachers, updateTeacherPassword } from "../api/resources";
import { exportCurrentPage } from "../utils/pdf";

export default function Teachers() {
  const currentTeacher = JSON.parse(localStorage.getItem("teacher_session") || "null");
  const isAdmin = currentTeacher?.role === "admin";
  const [teachers, setTeachers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form, setForm] = useState({ username: "", nom: "", password: "", role: "enseignant", filiere: "CIEL" });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [pendingTeachers, setPendingTeachers] = useState([]);

  const loadTeachers = async () => {
    const data = await getTeachers();
    setTeachers(data);
    if (isAdmin) setPendingTeachers(await getPendingTeachers());
  };

  const approve = async (teacher, role) => {
    try {
      await approveTeacher(teacher.id, role);
      setMessage("Compte approuvé.");
      await loadTeachers();
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible d'approuver le compte.");
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const submitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await createTeacher(form);
      setMessage(response.message || "Compte créé.");
      setForm({ username: "", nom: "", password: "", role: "enseignant", filiere: "CIEL" });
      setShowCreate(false);
      await loadTeachers();
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible de créer le compte.");
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !password.trim()) {
      setError("Le mot de passe est requis.");
      return;
    }

    try {
      const response = await updateTeacherPassword(selectedTeacher.id, password);
      setMessage(response.message || "Mot de passe mis à jour.");
      setPassword("");
      setSelectedTeacher(null);
      setShowPassword(false);
      await loadTeachers();
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible de modifier le mot de passe.");
    }
  };

  const removeTeacher = async (teacher) => {
    if (!window.confirm(`Supprimer le compte de ${teacher.nom || teacher.username} et toutes ses données ?`)) return;
    setError("");
    setMessage("");
    try {
      await deleteTeacher(teacher.id);
      setMessage("Compte enseignant supprimé.");
      await loadTeachers();
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible de supprimer le compte.");
    }
  };

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">Sécurité</span>
          <h1>Enseignants</h1>
          <div className="sub">Gestion des comptes enseignants</div>
        </div>
        {isAdmin && <div className="toolbar">
          <button type="button" className="btn" onClick={() => exportCurrentPage("Enseignants")}>Exporter PDF</button>
          <button className="btn btn-copper" onClick={() => setShowCreate(true)}>+ Nouvel enseignant</button>
        </div>}
      </div>

      {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}
      {message && <div className="success-box" style={{ marginBottom: 16 }}>{message}</div>}

      {pendingTeachers.length > 0 && <section style={{ marginBottom: 24 }}>
        <div className="section-title">Comptes à valider</div>
        <div className="grid grid-3">
          {pendingTeachers.map((teacher) => <div key={teacher.id} className="card">
            <div className="card-title">En attente</div>
            <h3>{teacher.nom}</h3>
            <div className="muted">{teacher.email} · {teacher.filiere}</div>
            <div style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={() => approve(teacher, "enseignant")}>Approuver enseignant</button>
              <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => approve(teacher, "admin")}>Approuver admin</button>
            </div>
          </div>)}
        </div>
      </section>}

      <div className="grid grid-3">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="card">
            <div className="card-title">Enseignant</div>
            <h3>{teacher.nom || teacher.username}</h3>
            <div className="muted" style={{ marginTop: 8 }}>Identifiant : {teacher.username}</div>
            <div className="muted">Rôle : {teacher.role}</div>
            <div style={{ marginTop: 18 }}>
              {isAdmin && <button
                type="button"
                className="btn"
                onClick={() => {
                  setSelectedTeacher(teacher);
                  setPassword("");
                  setShowPassword(true);
                }}
              >
                Modifier le mot de passe
              </button>}
              {isAdmin && <button type="button" className="btn" style={{ marginLeft: 8, color: "#b42318" }} onClick={() => removeTeacher(teacher)}>
                Supprimer
              </button>}
            </div>
          </div>
        ))}
      </div>

      {isAdmin && showCreate && (
        <Modal title="Créer un enseignant" onClose={() => setShowCreate(false)}>
          <form onSubmit={submitCreate}>
            <div className="field">
              <label>Nom complet</label>
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex : M. Dupont"
              />
            </div>
            <div className="field">
              <label>Nom d'utilisateur</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="enseignant2"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <div className="password-field">
                <input type={showFormPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="********" />
                <button type="button" className="password-toggle" onClick={() => setShowFormPassword((current) => !current)}>{showFormPassword ? "Masquer" : "Afficher"}</button>
              </div>
            </div>
            <div className="field">
              <label>Rôle</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="enseignant">Enseignant</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="field">
              <label>Filière</label>
              <input value={form.filiere} onChange={(e) => setForm({ ...form, filiere: e.target.value })} placeholder="CIEL" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowCreate(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Créer</button>
            </div>
          </form>
        </Modal>
      )}

      {isAdmin && showPassword && selectedTeacher && (
        <Modal title={`Mot de passe · ${selectedTeacher.nom || selectedTeacher.username}`} onClose={() => setShowPassword(false)}>
          <form onSubmit={submitPassword}>
            <div className="field">
              <label>Nouveau mot de passe</label>
              <div className="password-field">
                <input type={showEditPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" autoFocus />
                <button type="button" className="password-toggle" onClick={() => setShowEditPassword((current) => !current)}>{showEditPassword ? "Masquer" : "Afficher"}</button>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowPassword(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
