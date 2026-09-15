import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getClasses, createClasse } from "../api/resources";
import Modal from "../components/Modal";
import { exportCurrentPage } from "../utils/pdf";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nom, setNom] = useState("");
  const [annee, setAnnee] = useState("2026-2027");
  const [error, setError] = useState("");

  const load = () => getClasses().then(setClasses);

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const cleanName = nom.trim();
    if (!cleanName) {
      setError("Le nom de la classe est obligatoire.");
      return;
    }
    setError("");
    try {
      await createClasse({ nom: cleanName, annee_scolaire: annee.trim() || "2026-2027" });
      setNom("");
      setShowModal(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible de créer la classe. Vérifiez que le serveur est démarré.");
    }
  };

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">Organisation</span>
          <h1>Classes</h1>
          <div className="sub">{classes.length} classe(s) enregistrée(s)</div>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={() => exportCurrentPage("Classes")}>Exporter PDF</button>
          <button className="btn btn-copper" onClick={() => setShowModal(true)}>+ Nouvelle classe</button>
        </div>
      </div>

      {error && !showModal && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="grid grid-3">
        {classes.map((c) => (
          <Link key={c.id} to={`/classes/${c.id}`} style={{ textDecoration: "none" }}>
            <div className="card card-tick">
              <div className="card-title">{c.annee_scolaire}</div>
              <h3 style={{ fontSize: 19, marginBottom: 10 }}>{c.nom}</h3>
              <div className="muted" style={{ fontSize: 13 }}>
                {c.nb_eleves} élèves · {c.nb_cours} cours
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <Modal title="Nouvelle classe" onClose={() => setShowModal(false)}>
          <form onSubmit={submit}>
            {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="field">
              <label>Nom de la classe</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex : 1 CIEL" autoFocus />
            </div>
            <div className="field">
              <label>Année scolaire</label>
              <input value={annee} onChange={(e) => setAnnee(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Créer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
