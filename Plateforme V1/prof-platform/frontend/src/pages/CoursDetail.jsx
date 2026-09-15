import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getCours, updateCours, deleteCours,
  getCategories,
  uploadRessource, deleteRessource, downloadRessource,
} from "../api/resources";
import StatusBadge from "../components/StatusBadge";
import { exportCurrentPage } from "../utils/pdf";

export default function CoursDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const coursId = Number(id);
  const [cours, setCours] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);

  const load = () => getCours(coursId).then((c) => { setCours(c); setForm(c); });

  useEffect(() => { load(); }, [coursId]);
  useEffect(() => {
    if (!cours?.classe_id) return;
    getCategories({ classe_id: cours.classe_id }).then(setCategories);
  }, [cours?.classe_id]);

  if (!cours || !form) return <div className="main"><p className="muted">Chargement…</p></div>;

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const save = async () => {
    setSaving(true);
    await updateCours(coursId, {
      categorie_id: Number(form.categorie_id),
      titre: form.titre, objectifs: form.objectifs, contenu: form.contenu,
      exercices: form.exercices, tp: form.tp, statut: form.statut,
    });
    await load();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement ce cours ?")) return;
    await deleteCours(coursId);
    navigate(`/classes/${cours.classe_id}`);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("Seuls les fichiers PDF sont acceptés pour les ressources du cours.");
      e.target.value = "";
      return;
    }

    await uploadRessource(coursId, file);
    e.target.value = "";
    load();
  };

  const handleDownload = async (resource) => {
    try {
      await downloadRessource(resource.id, resource.nom_fichier);
    } catch (error) {
      alert(error?.response?.data?.error || "Impossible de télécharger ce document à distance.");
    }
  };

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            <Link to={`/classes/${cours.classe_id}`}>{cours.classe_nom}</Link>
            {" · "}<span className="cat-chip">{cours.categorie_code}</span> {cours.categorie_nom}
          </span>
          <h1>{cours.titre}</h1>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={() => exportCurrentPage(`Cours ${cours.titre}`)}>Exporter PDF</button>
          <StatusBadge status={cours.statut} />
          <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Groupe de cours</label>
          <select value={form.categorie_id || ""} onChange={handleChange("categorie_id")}>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>{categorie.code} - {categorie.nom}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Titre</label>
          <input value={form.titre} onChange={handleChange("titre")} />
        </div>
        <div className="field">
          <label>Statut</label>
          <select value={form.statut} onChange={handleChange("statut")}>
            <option value="a_faire">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
        </div>
        <div className="field">
          <label>Objectifs</label>
          <textarea value={form.objectifs || ""} onChange={handleChange("objectifs")} />
        </div>
        <div className="field">
          <label>Contenu du cours</label>
          <textarea style={{ minHeight: 160 }} value={form.contenu || ""} onChange={handleChange("contenu")} />
        </div>
        <div className="field">
          <label>Exercices</label>
          <textarea value={form.exercices || ""} onChange={handleChange("exercices")} />
        </div>
        <div className="field">
          <label>Travaux pratiques (TP)</label>
          <textarea value={form.tp || ""} onChange={handleChange("tp")} />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>

      <div className="section-title">Ressources et fichiers</div>
      <div className="card">
        {cours.ressources.length === 0 ? (
          <p className="muted" style={{ margin: "0 0 14px" }}>Aucune ressource ajoutée.</p>
        ) : (
          <ul className="list-plain" style={{ marginBottom: 14 }}>
            {cours.ressources.map((r) => (
              <li key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" className="btn btn-sm" onClick={() => handleDownload(r)}>{r.nom_fichier}</button>
                <button className="btn btn-sm" onClick={async () => { await deleteRessource(r.id); load(); }}>Supprimer</button>
              </li>
            ))}
          </ul>
        )}
        <label className="btn">
          + Importer un PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>
    </div>
  );
}
