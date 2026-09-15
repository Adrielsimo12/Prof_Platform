import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getEleve,
  deleteEleve,
  addEvaluation,
  deleteEvaluation,
  addObservation,
  deleteObservation,
  addTravail,
  updateTravail,
  deleteTravail,
  getCoursList,
  getActivites,
  getEvaluationsCompetences,
  createEvaluationCompetence,
  updateEvaluationCompetence,
  deleteEvaluationCompetence,
} from "../api/resources";
import StatusBadge from "../components/StatusBadge";
import { exportCurrentPage } from "../utils/pdf";

const NIVEAUX = [
  { value: 0, label: "Non acquis", color: "danger" },
  { value: 1, label: "En cours", color: "warning" },
  { value: 2, label: "Partiellement acquis", color: "info" },
  { value: 3, label: "Acquis", color: "success" },
];

export default function EleveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eleveId = Number(id);

  const [eleve, setEleve] = useState(null);
  const [cours, setCours] = useState([]);
  const [activites, setActivites] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const loadEleve = () => getEleve(eleveId).then(setEleve);

  useEffect(() => {
    loadEleve();
  }, [eleveId]);

  useEffect(() => {
    if (!eleve) return;
    getCoursList({ classe_id: eleve.classe_id }).then(setCours);
    getActivites({ classe_id: eleve.classe_id }).then(setActivites);
    getEvaluationsCompetences({ eleve_id: eleve.id }).then(setEvaluations);
  }, [eleve?.classe_id, eleve?.id]);

  if (!eleve) return <div className="main"><p className="muted">Chargement…</p></div>;

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement ${eleve.prenom} ${eleve.nom} ?`)) return;
    await deleteEleve(eleveId);
    navigate(`/classes/${eleve.classe_id}`);
  };

  const getEvaluationFor = (activiteId, competenceId) =>
    evaluations.find(
      (ev) => ev.activite_id === activiteId && ev.competence_id === competenceId
    );

  const getProgression = (activiteId) => {
    const items = evaluations.filter((ev) => ev.activite_id === activiteId);
    if (!items.length) return 0;
    const moyenne = items.reduce((sum, item) => sum + Number(item.niveau || 0), 0) / items.length;
    return Math.round((moyenne / 3) * 100);
  };

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Link to={`/classes/${eleve.classe_id}`}>{eleve.classe_nom}</Link></span>
          <h1>{eleve.prenom} {eleve.nom}</h1>
          <div className="sub">{eleve.email || "Aucun email renseigné"}</div>
        </div>
        <div className="toolbar print-actions">
          <button type="button" className="btn" onClick={() => exportCurrentPage(`Fiche ${eleve.prenom} ${eleve.nom}`)}>Exporter PDF</button>
          <button className="btn btn-danger" onClick={handleDelete}>Supprimer l'élève</button>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        <div className="card">
          <div className="card-title">Absences</div>
          <div className="stat-value">{eleve.nb_absences}</div>
        </div>
        <div className="card">
          <div className="card-title">Retards</div>
          <div className="stat-value">{eleve.nb_retards}</div>
        </div>
        <div className="card">
          <div className="card-title">Moyenne</div>
          <div className="stat-value">{eleve.moyenne ?? "—"}</div>
        </div>
      </div>

      <div className="section-title">Suivi CIEL</div>
      <div className="card" style={{ marginBottom: 24 }}>
        {activites.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Aucune activité liée à cette classe.</p>
        ) : (
          <div className="ciele-stack">
            {activites.map((activite) => {
              const progression = getProgression(activite.id);
              return (
                <div key={activite.id} className="ciel-activity">
                  <div className="ciel-activity-header">
                    <div>
                      <strong>{activite.titre}</strong>
                      <div className="muted small-text">{activite.cours_titre || "Sans cours"}</div>
                    </div>
                    <div className="ciel-progress-value">{progression}%</div>
                  </div>

                  <div className="ciel-progress-track">
                    <div className="ciel-progress-bar" style={{ width: `${progression}%` }} />
                  </div>

                  {(!activite.competences || activite.competences.length === 0) ? (
                    <p className="muted" style={{ margin: 0 }}>Aucune compétence rattachée.</p>
                  ) : (
                    <div className="ciel-competence-list">
                      {activite.competences.map((comp) => {
                        const ev = getEvaluationFor(activite.id, comp.id);
                        const currentLevel = ev?.niveau ?? null;

                        return (
                          <div key={`${activite.id}-${comp.id}`} className="ciel-competence-row">
                            <div className="ciel-competence-meta">
                              <strong>{comp.code}</strong>
                              <span>{comp.nom}</span>
                            </div>

                            <div className="niveau-buttons">
                              {NIVEAUX.map((niveau) => (
                                <button
                                  key={niveau.value}
                                  type="button"
                                  className={`niveau-button ${currentLevel === niveau.value ? "active " + niveau.color : ""}`}
                                  onClick={async () => {
                                    const payload = {
                                      eleve_id: eleve.id,
                                      competence_id: comp.id,
                                      activite_id: activite.id,
                                      niveau: niveau.value,
                                      commentaire: "",
                                    };

                                    if (ev) {
                                      await updateEvaluationCompetence(ev.id, { niveau: niveau.value });
                                    } else {
                                      await createEvaluationCompetence(payload);
                                    }

                                    const next = await getEvaluationsCompetences({ eleve_id: eleve.id });
                                    setEvaluations(next);
                                  }}
                                >
                                  {niveau.label}
                                </button>
                              ))}
                            </div>

                            {ev && (
                              <div className="ciel-eval-actions">
                                <span className={`status-pill status-${NIVEAUX.find((n) => n.value === ev.niveau)?.color || "default"}`}>
                                  {NIVEAUX.find((n) => n.value === ev.niveau)?.label || "Évalué"}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  onClick={async () => {
                                    await deleteEvaluationCompetence(ev.id);
                                    setEvaluations((current) => current.filter((item) => item.id !== ev.id));
                                  }}
                                >
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EvaluationsSection eleve={eleve} cours={cours} onChange={loadEleve} />
      <TravauxSection eleve={eleve} cours={cours} onChange={loadEleve} />
      <ObservationsSection eleve={eleve} onChange={loadEleve} />
      <PresencesSection eleve={eleve} />
    </div>
  );
}

function EvaluationsSection({ eleve, cours, onChange }) {
  const [titre, setTitre] = useState("");
  const [note, setNote] = useState("");
  const [bareme, setBareme] = useState(20);
  const [coursId, setCoursId] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!titre.trim()) return;
    await addEvaluation(eleve.id, {
      titre,
      note: note === "" ? null : Number(note),
      bareme: Number(bareme),
      cours_id: coursId || null,
      commentaire,
    });
    setTitre("");
    setNote("");
    setCommentaire("");
    onChange();
  };

  return (
    <>
      <div className="section-title">Évaluations</div>
      <div className="card" style={{ marginBottom: 12 }}>
        {eleve.evaluations.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Aucune évaluation enregistrée.</p>
        ) : (
          <table>
            <thead><tr><th>Titre</th><th>Cours</th><th>Note</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {eleve.evaluations.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.titre || "—"}</td>
                  <td className="muted">{ev.cours_titre || "—"}</td>
                  <td className="mono">{ev.note ?? "—"}/{ev.bareme}</td>
                  <td className="mono">{ev.date}</td>
                  <td><button className="btn btn-sm" onClick={async () => { await deleteEvaluation(ev.id); onChange(); }}>Suppr.</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
        <div className="grid grid-3">
          <div className="field"><label>Titre</label><input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="ex : TP réseaux n°2" /></div>
          <div className="field"><label>Note</label><input type="number" step="0.5" value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <div className="field"><label>Barème</label><input type="number" value={bareme} onChange={(e) => setBareme(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Cours associé</label>
          <select value={coursId} onChange={(e) => setCoursId(e.target.value)}>
            <option value="">— Aucun —</option>
            {cours.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
        </div>
        <div className="field"><label>Commentaire</label><textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} /></div>
        <button type="submit" className="btn btn-primary">Ajouter l'évaluation</button>
      </form>
    </>
  );
}

function TravauxSection({ eleve, cours, onChange }) {
  const [titre, setTitre] = useState("");
  const [coursId, setCoursId] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!titre.trim()) return;
    await addTravail(eleve.id, { titre, cours_id: coursId || null });
    setTitre("");
    onChange();
  };

  const cycleStatut = async (t) => {
    const order = ["a_rendre", "rendu", "en_retard"];
    const next = order[(order.indexOf(t.statut) + 1) % order.length];
    await updateTravail(t.id, { statut: next });
    onChange();
  };

  return (
    <>
      <div className="section-title">Travaux</div>
      <div className="card" style={{ marginBottom: 12 }}>
        {eleve.travaux.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Aucun travail enregistré.</p>
        ) : (
          <table>
            <thead><tr><th>Titre</th><th>Cours</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {eleve.travaux.map((t) => (
                <tr key={t.id}>
                  <td>{t.titre}</td>
                  <td className="muted">{t.cours_titre || "—"}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => cycleStatut(t)} title="Cliquer pour changer le statut">
                      <StatusBadge status={t.statut} />
                    </button>
                  </td>
                  <td><button className="btn btn-sm" onClick={async () => { await deleteTravail(t.id); onChange(); }}>Suppr.</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
        <div className="grid grid-2">
          <div className="field"><label>Titre du travail</label><input value={titre} onChange={(e) => setTitre(e.target.value)} /></div>
          <div className="field">
            <label>Cours associé</label>
            <select value={coursId} onChange={(e) => setCoursId(e.target.value)}>
              <option value="">— Aucun —</option>
              {cours.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Ajouter le travail</button>
      </form>
    </>
  );
}

function ObservationsSection({ eleve, onChange }) {
  const [texte, setTexte] = useState("");
  const [categorie, setCategorie] = useState("autre");

  const submit = async (e) => {
    e.preventDefault();
    if (!texte.trim()) return;
    await addObservation(eleve.id, { texte, categorie });
    setTexte("");
    onChange();
  };

  return (
    <>
      <div className="section-title">Observations</div>
      <div className="card" style={{ marginBottom: 12 }}>
        {eleve.observations.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Aucune observation enregistrée.</p>
        ) : (
          <ul className="list-plain">
            {eleve.observations.map((o) => (
              <li key={o.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <span className="mono muted" style={{ fontSize: 12 }}>{o.date} · {o.categorie}</span>
                  <div>{o.texte}</div>
                </div>
                <button className="btn btn-sm" onClick={async () => { await deleteObservation(o.id); onChange(); }}>Suppr.</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
        <div className="field">
          <label>Catégorie</label>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            <option value="comportement">Comportement</option>
            <option value="travail">Travail</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="field"><label>Observation</label><textarea value={texte} onChange={(e) => setTexte(e.target.value)} /></div>
        <button type="submit" className="btn btn-primary">Ajouter l'observation</button>
      </form>
    </>
  );
}

function PresencesSection({ eleve }) {
  return (
    <>
      <div className="section-title">Historique de présence</div>
      <div className="card">
        {eleve.presences.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Aucune séance enregistrée pour cet élève.</p>
        ) : (
          <ul className="list-plain">
            {[...eleve.presences].reverse().slice(0, 20).map((p) => (
              <li key={p.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <Link to={`/seances/${p.seance_id}`}>Séance #{p.seance_id}</Link>
                <StatusBadge status={p.statut} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
