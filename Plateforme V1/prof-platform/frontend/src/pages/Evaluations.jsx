import { useEffect, useState } from "react";

import {
  getClasses,
  getElevesDeClasse,
  getActivites,
  getCompetences,
  getEvaluationsCompetences,
  createEvaluationCompetence,
  updateEvaluationCompetence,
  deleteEvaluationCompetence,
  getEvaluationActivite,
  saveEvaluationActivite,
  getAppreciations,
} from "../api/resources";
import { exportCurrentPage } from "../utils/pdf";

const NIVEAUX = [
  {
    value: 0,
    label: "Non acquis",
    icon: "🔴",
  },
  {
    value: 1,
    label: "En cours",
    icon: "🟠",
  },
  {
    value: 2,
    label: "Partiellement acquis",
    icon: "🟡",
  },
  {
    value: 3,
    label: "Acquis",
    icon: "🟢",
  },
];

export default function Evaluations() {

  const [classes, setClasses] =
    useState([]);

  const [eleves, setEleves] =
    useState([]);

  const [activites, setActivites] =
    useState([]);

  const [competences, setCompetences] =
    useState([]);

  const [evaluations, setEvaluations] =
    useState([]);

  const [classeId, setClasseId] =
    useState("");

  const [groupe, setGroupe] =
    useState("tous");

  const [eleveId, setEleveId] =
    useState("");

  const [activiteId, setActiviteId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [appreciations, setAppreciations] = useState([]);
  const [pendingAppreciations, setPendingAppreciations] = useState({});

  useEffect(() => {

    getClasses()
      .then(setClasses)
      .catch(console.error);

  }, []);

  useEffect(() => {

    if (!classeId) {
      setEleves([]);
      setEleveId("");
      setActivites([]);
      setActiviteId("");
      return;
    }

    getElevesDeClasse(classeId)
      .then(setEleves)
      .catch(console.error);

    getActivites({ classe_id: classeId })
      .then(setActivites)
      .catch(console.error);

  }, [classeId]);

  useEffect(() => {

    if (!eleveId) {
      setEvaluations([]);
      return;
    }

    setLoading(true);

    getEvaluationsCompetences({
      eleve_id: eleveId,
      activite_id: activiteId || undefined,
    })
      .then(setEvaluations)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });

  }, [eleveId, activiteId]);

  useEffect(() => {
    setNote("");
    setNoteId(null);
    setNoteMessage("");
    if (!eleveId || !activiteId) return;
    getEvaluationActivite({ eleve_id: eleveId, activite_id: activiteId })
      .then((items) => {
        const saved = items[0];
        setNote(saved ? String(saved.note) : "");
        setNoteId(saved?.id || null);
      })
      .catch(console.error);
  }, [eleveId, activiteId]);

  useEffect(() => {
    if (!classeId) {
      setCompetences([]);
      setAppreciations([]);
      return;
    }

    getCompetences({ classe_id: classeId })
      .then(setCompetences)
      .catch(console.error);

    getAppreciations({ classe_id: classeId })
      .then(setAppreciations)
      .catch(console.error);
  }, [classeId]);

  const selectedActivite = activites.find((a) => String(a.id) === String(activiteId)) || null;
  const selectedClasse = classes.find((classe) => String(classe.id) === String(classeId));
  const isTne = selectedClasse?.nom?.replace(/\s/g, "").toUpperCase() === "2TNE";
  const elevesFiltres = isTne && groupe !== "tous"
    ? eleves.filter((eleve) => eleve.groupe === groupe)
    : eleves;

  const activiteCompetences =
    selectedActivite?.competences && selectedActivite.competences.length > 0
      ? selectedActivite.competences
      : [];

  const getEvaluation = (competenceId) => {
    return evaluations.find(
      (evaluation) =>
        Number(evaluation.competence_id) === Number(competenceId)
    );
  };

  const evaluer = async (competenceId, niveau) => {
    if (!eleveId) {
      alert("Sélectionnez d'abord un élève.");
      return;
    }

    if (!activiteId) {
      alert("Sélectionnez d'abord une activité.");
      return;
    }

    try {
      const existing = getEvaluation(competenceId);

      if (existing) {
        const updated = await updateEvaluationCompetence(existing.id, {
          niveau,
          appreciation_id: existing.appreciation_id || pendingAppreciations[competenceId] || null,
          commentaire: existing.commentaire || "",
        });

        setEvaluations((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item
          )
        );
        return;
      }

      const result = await createEvaluationCompetence({
        eleve_id: Number(eleveId),
        competence_id: competenceId,
        activite_id: Number(activiteId),
        niveau,
        appreciation_id: pendingAppreciations[competenceId] || null,
        commentaire: "",
      });

      setEvaluations((current) => [result, ...current]);
    } catch (error) {
      console.error(error);
      alert("Impossible d'enregistrer l'évaluation.");
    }
  };

  const choisirAppreciation = async (competenceId, appreciationId) => {
    setPendingAppreciations((current) => ({ ...current, [competenceId]: appreciationId }));
    const existing = getEvaluation(competenceId);
    if (existing) {
      const updated = await updateEvaluationCompetence(existing.id, { appreciation_id: appreciationId || null });
      setEvaluations((current) => current.map((item) => item.id === updated.id ? updated : item));
    }
  };

  const supprimerEvaluation = async (id) => {
    await deleteEvaluationCompetence(id);
    setEvaluations((current) => current.filter((item) => item.id !== id));
  };

  const validerNote = async () => {
    const numericNote = Number(note);
    if (!eleveId || !activiteId || note === "" || Number.isNaN(numericNote) || numericNote < 0 || numericNote > 20) {
      setNoteMessage("Saisissez une note comprise entre 0 et 20.");
      return;
    }
    setSavingNote(true);
    setNoteMessage("");
    try {
      const saved = await saveEvaluationActivite({ eleve_id: Number(eleveId), activite_id: Number(activiteId), note: numericNote });
      setNoteId(saved.id);
      setNote(String(saved.note));
      setNoteMessage("Note validée");
    } catch (error) {
      setNoteMessage(error?.response?.data?.error || "Impossible d'enregistrer la note.");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="main">

      <div className="page-header">

        <div>

          <span className="eyebrow">
            Suivi pédagogique
          </span>

          <h1>
            Évaluations
          </h1>

          <div className="sub">
            Évaluation par classe, élève, activité et compétence
          </div>

        </div>

        <div className="toolbar print-actions">
          <button type="button" className="btn" onClick={() => exportCurrentPage("Évaluations")}>Exporter PDF</button>
        </div>

      </div>

      {/* ============================================================
         SELECTION
      ============================================================ */}

      <div className="card">

        <div className="grid grid-3">

          <div className="field">

            <label>
              Classe
            </label>

            <select
              value={classeId}
              onChange={(e) => {
                setClasseId(e.target.value);
                setEleveId("");
                setActiviteId("");
                setGroupe("tous");
              }}
            >

              <option value="">
                — Sélectionner —
              </option>

              {classes.map((classe) => (

                <option
                  key={classe.id}
                  value={classe.id}
                >
                  {classe.nom}
                </option>

              ))}

            </select>

          </div>

          {isTne && (
            <div className="field">
              <label>Groupe 2 TNE</label>
              <select value={groupe} onChange={(e) => { setGroupe(e.target.value); setEleveId(""); setActiviteId(""); }}>
                <option value="tous">Les deux groupes</option>
                <option value="Groupe 1">Groupe 1</option>
                <option value="Groupe 2">Groupe 2</option>
              </select>
            </div>
          )}

          <div className="field">

            <label>
              Élève
            </label>

            <select
              value={eleveId}
              onChange={(e) => {
                setEleveId(e.target.value);
              }}
              disabled={!classeId}
            >

              <option value="">
                — Sélectionner —
              </option>

              {elevesFiltres.map((eleve) => (

                <option
                  key={eleve.id}
                  value={eleve.id}
                >
                  {eleve.nom}{" "}
                  {eleve.prenom}
                </option>

              ))}

            </select>

          </div>

          <div className="field">

            <label>
              Activité
            </label>

            <select
              value={activiteId}
              onChange={(e) => setActiviteId(e.target.value)}
              disabled={!classeId || !eleveId}
            >

              <option value="">
                — Sélectionner —
              </option>

              {activites.map((activite) => (

                <option
                  key={activite.id}
                  value={activite.id}
                >
                  {activite.titre}
                </option>

              ))}

            </select>

          </div>

        </div>

      </div>

      {/* ============================================================
         REFERENTIEL
      ============================================================ */}

      {!eleveId ? (

        <div className="card">

          <p>
            Sélectionnez une classe puis
            un élève pour commencer
            l'évaluation.
          </p>

        </div>

      ) : !activiteId ? (

        <div className="card">

          <p>
            Sélectionnez une activité pour afficher
            les compétences de cette séance.
          </p>

        </div>

      ) : loading ? (

        <div className="card">
          Chargement...
        </div>

      ) : activiteCompetences.length === 0 ? (

        <>
          <div className="card grade-entry-card">
            <div><span className="eyebrow">Résultat</span><h2>Note obtenue</h2><p className="muted small-text">Saisissez la note finale de l’activité sur 20.</p></div>
            <div className="grade-entry-controls">
              <div className="grade-input-wrap"><input type="number" min="0" max="20" step="0.25" value={note} onChange={(e) => { setNote(e.target.value); setNoteMessage(""); }} placeholder="--" aria-label="Note sur 20" /><span>/ 20</span></div>
              <button type="button" className="btn btn-primary" onClick={validerNote} disabled={savingNote}>{savingNote ? "Validation…" : "Valider la note"}</button>
              {noteMessage && <span className={noteMessage === "Note validée" ? "note-success" : "note-error"}>{noteMessage}</span>}
            </div>
          </div>
          <div className="card"><p>Cette activité ne contient aucune compétence associée.</p></div>
        </>

      ) : (

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >

          <div className="card grade-entry-card">
            <div>
              <span className="eyebrow">Résultat</span>
              <h2>Note obtenue</h2>
              <p className="muted small-text">Saisissez la note finale de l’activité sur 20.</p>
            </div>
            <div className="grade-entry-controls">
              <div className="grade-input-wrap">
                <input type="number" min="0" max="20" step="0.25" value={note} onChange={(e) => { setNote(e.target.value); setNoteMessage(""); }} placeholder="--" aria-label="Note sur 20" />
                <span>/ 20</span>
              </div>
              <button type="button" className="btn btn-primary" onClick={validerNote} disabled={savingNote}>{savingNote ? "Validation…" : "Valider la note"}</button>
              {noteMessage && <span className={noteMessage === "Note validée" ? "note-success" : "note-error"}>{noteMessage}</span>}
            </div>
          </div>

          {activiteCompetences.map((competence) => {
            const evaluation = getEvaluation(competence.id);

            return (
              <div key={competence.id} className="card">

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >

                  <div>
                    <strong>{competence.code}</strong>
                    <div>{competence.nom}</div>
                    {evaluation && (
                      <small>
                        Niveau actuel : <strong>{evaluation.niveau_label}</strong>
                      </small>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <select
                      value={evaluation?.appreciation_id || pendingAppreciations[competence.id] || ""}
                      onChange={(event) => choisirAppreciation(competence.id, event.target.value ? Number(event.target.value) : "")}
                      aria-label={`Appréciation pour ${competence.code}`}
                    >
                      <option value="">Choisir une appréciation</option>
                      {appreciations.map((appreciation) => <option key={appreciation.id} value={appreciation.id}>{appreciation.libelle}</option>)}
                    </select>
                    {NIVEAUX.map((niveau) => (
                      <button
                        key={niveau.value}
                        type="button"
                        className="btn"
                        title={niveau.label}
                        onClick={() => evaluer(competence.id, niveau.value)}
                        style={{
                          fontSize: "12px",
                          padding: "6px 8px",
                          opacity:
                            evaluation && evaluation.niveau === niveau.value ? 1 : 0.65,
                        }}
                      >
                        {niveau.icon} {niveau.label}
                      </button>
                    ))}
                  </div>

                </div>

                {evaluation && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => supprimerEvaluation(evaluation.id)}
                    >
                      Supprimer l’évaluation
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
}
