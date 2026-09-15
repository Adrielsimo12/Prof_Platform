import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSeance, updateSeance, updatePresences, deleteSeance, getCoursList } from "../api/resources";
import StatusBadge from "../components/StatusBadge";
import { exportCurrentPage } from "../utils/pdf";

export default function SeanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const seanceId = Number(id);
  const [seance, setSeance] = useState(null);
  const [form, setForm] = useState(null);
  const [coursOptions, setCoursOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => getSeance(seanceId).then((s) => { setSeance(s); setForm(s); });

  useEffect(() => { load(); }, [seanceId]);
  useEffect(() => {
    if (seance) getCoursList({ classe_id: seance.classe_id }).then(setCoursOptions);
  }, [seance?.classe_id]);

  if (!seance || !form) return <div className="main"><p className="muted">Chargement…</p></div>;

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const supportsGroups = form.classe_nom?.replace(/\s/g, "").toUpperCase() === "2TNE";

  const save = async () => {
    setSaving(true);
    await updateSeance(seanceId, {
      cours_id: form.cours_id || null,
      heure_debut: form.heure_debut,
      heure_fin: form.heure_fin,
      contenu_realise: form.contenu_realise,
      travail_donne: form.travail_donne,
      observations: form.observations,
      groupe: form.groupe,
    });
    await load();
    setSaving(false);
  };

  const togglePresence = async (presence) => {
    const order = ["present", "absent", "retard"];
    const next = order[(order.indexOf(presence.statut) + 1) % order.length];
    await updatePresences(seanceId, [{ eleve_id: presence.eleve_id, statut: next }]);
    load();
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement cette séance ?")) return;
    await deleteSeance(seanceId);
    navigate(`/classes/${seance.classe_id}`);
  };

  const toggleCancellation = async () => {
    const nextStatus = seance.statut === "annulee" ? "planifiee" : "annulee";
    const message = nextStatus === "annulee"
      ? "Annuler cette séance ? Elle restera conservée dans l'historique."
      : "Rétablir cette séance ?";
    if (!confirm(message)) return;
    await updateSeance(seanceId, { statut: nextStatus });
    await load();
  };

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Link to={`/classes/${seance.classe_id}`}>{seance.classe_nom}</Link></span>
          <h1>Séance du {seance.date}</h1>
          <div className="sub">{seance.heure_debut} - {seance.heure_fin} · {seance.groupe} · <StatusBadge status={seance.statut} /></div>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={() => exportCurrentPage(`Séance ${seance.date}`)}>Exporter PDF</button>
          <button className={seance.statut === "annulee" ? "btn btn-primary" : "btn btn-danger"} onClick={toggleCancellation}>
            {seance.statut === "annulee" ? "Rétablir la séance" : "Annuler la séance"}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid grid-2">
          <div className="field"><label>Début</label><input type="time" value={form.heure_debut || ""} onChange={handleChange("heure_debut")} /></div>
          <div className="field"><label>Fin</label><input type="time" value={form.heure_fin || ""} onChange={handleChange("heure_fin")} /></div>
        </div>
        <div className="field">
          <label>Groupe concerné</label>
          <select value={supportsGroups ? (form.groupe || "Toute la classe") : "Toute la classe"} disabled={!supportsGroups} onChange={handleChange("groupe")}>
            <option value="Toute la classe">Toute la classe</option>
            <option value="Groupe 1">Groupe 1</option>
            <option value="Groupe 2">Groupe 2</option>
          </select>
        </div>
        <div className="field">
          <label>Cours concerné</label>
          <select value={form.cours_id || ""} onChange={handleChange("cours_id")}>
            <option value="">— Aucun —</option>
            {coursOptions.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Contenu réalisé</label>
          <textarea style={{ minHeight: 110 }} value={form.contenu_realise || ""} onChange={handleChange("contenu_realise")} />
        </div>
        <div className="field">
          <label>Travail donné</label>
          <textarea value={form.travail_donne || ""} onChange={handleChange("travail_donne")} />
        </div>
        <div className="field">
          <label>Observations</label>
          <textarea value={form.observations || ""} onChange={handleChange("observations")} />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <div className="section-title">Feuille de présence — {seance.nb_absents ?? 0} absent(s)</div>
      <div className="card">
        <p className="muted" style={{ marginTop: 0, fontSize: 12.5 }}>Cliquez sur le statut pour le faire tourner : présent → absent → retard.</p>
        <table>
          <thead><tr><th>Élève</th><th>Statut</th></tr></thead>
          <tbody>
            {seance.presences.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/eleves/${p.eleve_id}`}>{p.eleve_prenom} {p.eleve_nom}</Link></td>
                <td>
                  <button className="btn btn-sm" onClick={() => togglePresence(p)}>
                    <StatusBadge status={p.statut} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
