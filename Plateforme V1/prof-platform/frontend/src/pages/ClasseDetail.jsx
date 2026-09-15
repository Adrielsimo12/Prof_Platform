import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getClasse, getElevesDeClasse, exportEleves, importEleves, createEleve,
  updateEleve, getActivitesSuivi, updateActivitesSuivi,
  getCoursList, getCategories, createCours, getSeances, createSeance,
} from "../api/resources";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { exportCurrentPage } from "../utils/pdf";

export default function ClasseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const classeId = Number(id);
  const [classe, setClasse] = useState(null);
  const [tab, setTab] = useState("eleves");

  const [eleves, setEleves] = useState([]);
  const [cours, setCours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [seances, setSeances] = useState([]);
  const [suivi, setSuivi] = useState(null);

  const [showEleveModal, setShowEleveModal] = useState(false);
  const [showCoursModal, setShowCoursModal] = useState(false);
  const [showSeanceModal, setShowSeanceModal] = useState(false);

  const loadAll = () => {
    getClasse(classeId).then(setClasse);
    getElevesDeClasse(classeId).then(setEleves);
    getCoursList({ classe_id: classeId }).then(setCours);
    getCategories().then(setCategories);
    getSeances({ classe_id: classeId }).then(setSeances);
    getActivitesSuivi(classeId).then(setSuivi);
  };

  useEffect(() => { loadAll(); }, [classeId]);

  const handleExport = async () => {
    const { filename, content } = await exportEleves(classeId);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await importEleves(classeId, reader.result);
      loadAll();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleGroupChange = async (eleve, groupe) => {
    if (classe?.nom?.replace(/\s/g, "").toUpperCase() !== "2TNE") return;
    const updated = await updateEleve(eleve.id, { groupe });
    setEleves((current) => current.map((item) => item.id === updated.id ? updated : item));
    setSuivi((current) => current ? {
      ...current,
      eleves: current.eleves.map((item) => item.id === updated.id ? updated : item),
    } : current);
  };

  const getActivityStatus = (activiteId, eleveId) =>
    suivi?.suivis?.find((item) => item.activite_id === activiteId && item.eleve_id === eleveId)?.statut || "a_commencer";

  const handleActivityStatus = async (activiteId, eleveId, statut) => {
    setSuivi((current) => {
      if (!current) return current;
      const existing = current.suivis.find((item) => item.activite_id === activiteId && item.eleve_id === eleveId);
      return {
        ...current,
        suivis: existing
          ? current.suivis.map((item) => item === existing ? { ...item, statut } : item)
          : [...current.suivis, { activite_id: activiteId, eleve_id: eleveId, statut }],
      };
    });
    try {
      const updated = await updateActivitesSuivi(classeId, {
        suivis: [{ activite_id: activiteId, eleve_id: eleveId, statut }],
      });
      setSuivi(updated);
    } catch (error) {
      console.error(error);
      getActivitesSuivi(classeId).then(setSuivi);
    }
  };

  if (!classe) return <div className="main"><p className="muted">Chargement…</p></div>;

  const coursParCategorie = categories.map((cat) => ({
    cat,
    items: cours.filter((c) => c.categorie_id === cat.id),
  }));

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">Classe</span>
          <h1>{classe.nom}</h1>
          <div className="sub">{classe.annee_scolaire} · {eleves.length} élèves · {cours.length} cours</div>
        </div>
        <button type="button" className="btn" onClick={() => exportCurrentPage(`Classe ${classe.nom}`)}>Exporter PDF</button>
      </div>

      <div className="tabs">
        <button className={tab === "eleves" ? "active" : ""} onClick={() => setTab("eleves")}>Élèves</button>
        <button className={tab === "cours" ? "active" : ""} onClick={() => setTab("cours")}>Cours</button>
        <button className={tab === "seances" ? "active" : ""} onClick={() => setTab("seances")}>Séances</button>
        <button className={tab === "activites" ? "active" : ""} onClick={() => setTab("activites")}>Activités</button>
      </div>

      {tab === "eleves" && (
        <div>
          <div className="toolbar" style={{ marginBottom: 16 }}>
            <button className="btn btn-copper" onClick={() => setShowEleveModal(true)}>+ Ajouter un élève</button>
            <button className="btn" onClick={handleExport}>Exporter (CSV)</button>
            <label className="btn" style={{ margin: 0 }}>
              Importer (CSV)
              <input type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} />
            </label>
            <span className="muted" style={{ fontSize: 12 }}>Format CSV : nom;prenom;email;date_naissance</span>
          </div>

          {eleves.length === 0 ? (
            <div className="empty-state">Aucun élève dans cette classe pour l'instant.</div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Groupe</th>
                    <th>Absences</th>
                    <th>Retards</th>
                    <th>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {eleves.map((e) => (
                    <tr key={e.id} className="row-link" onClick={() => navigate(`/eleves/${e.id}`)}>
                      <td>{e.nom}</td>
                      <td>{e.prenom}</td>
                      <td className="muted">{e.email || "—"}</td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <select
                          value={e.groupe || ""}
                          disabled={classe.nom?.replace(/\s/g, "").toUpperCase() !== "2TNE"}
                          onChange={(event) => handleGroupChange(e, event.target.value)}
                          aria-label={`Groupe de ${e.prenom} ${e.nom}`}
                        >
                          <option value="">{classe.nom?.replace(/\s/g, "").toUpperCase() === "2TNE" ? "—" : "Classe entière"}</option>
                          <option value="Groupe 1">Groupe 1</option>
                          <option value="Groupe 2">Groupe 2</option>
                        </select>
                      </td>
                      <td className="mono">{e.nb_absences}</td>
                      <td className="mono">{e.nb_retards}</td>
                      <td className="mono">{e.moyenne ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "cours" && (
        <div>
          <div className="toolbar" style={{ marginBottom: 16 }}>
            <button className="btn btn-copper" onClick={() => setShowCoursModal(true)}>+ Nouveau cours</button>
          </div>
          {coursParCategorie.map(({ cat, items }) => (
            <div key={cat.id} style={{ marginBottom: 22 }}>
              <div className="section-title" style={{ margin: "0 0 8px" }}>
                <span className="cat-chip">{cat.code}</span> — {cat.nom}
              </div>
              {items.length === 0 ? (
                <div className="empty-state">Aucun cours dans cette catégorie.</div>
              ) : (
                <div className="card">
                  <table>
                    <thead>
                      <tr><th>Titre</th><th>Statut</th></tr>
                    </thead>
                    <tbody>
                      {items.map((c) => (
                        <tr key={c.id} className="row-link" onClick={() => navigate(`/cours/${c.id}`)}>
                          <td>{c.titre}</td>
                          <td><StatusBadge status={c.statut} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "seances" && (
        <div>
          <div className="toolbar" style={{ marginBottom: 16 }}>
            <button className="btn btn-copper" onClick={() => setShowSeanceModal(true)}>+ Nouvelle séance</button>
            <Link className="btn" to="/planning">Voir le planning</Link>
          </div>
          {seances.length === 0 ? (
            <div className="empty-state">Aucune séance enregistrée pour cette classe.</div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr><th>Date</th><th>Horaire</th><th>Cours</th><th>Groupe</th><th>Statut</th><th>Absents</th></tr>
                </thead>
                <tbody>
                  {seances.map((s) => (
                    <tr key={s.id} className="row-link" onClick={() => navigate(`/seances/${s.id}`)}>
                      <td className="mono">{s.date}</td>
                      <td className="muted">{s.heure_debut || "—"}{s.heure_fin ? ` - ${s.heure_fin}` : ""}</td>
                      <td>{s.cours_titre || "—"}</td>
                      <td><span className="group-chip">{s.groupe || "Toute la classe"}</span></td>
                      <td><StatusBadge status={s.statut} /></td>
                      <td className="mono">{s.nb_absents ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "activites" && suivi && (
        <ActivitesSuivi
          suivi={suivi}
          getStatus={getActivityStatus}
          onStatusChange={handleActivityStatus}
        />
      )}

      {showEleveModal && (
        <EleveModal classeId={classeId} onClose={() => setShowEleveModal(false)} onCreated={loadAll} />
      )}
      {showCoursModal && (
        <CoursModal classeId={classeId} categories={categories} onClose={() => setShowCoursModal(false)} onCreated={loadAll} />
      )}
      {showSeanceModal && (
        <SeanceModal classeId={classeId} classeName={classe.nom} cours={cours} onClose={() => setShowSeanceModal(false)} onCreated={loadAll} />
      )}
    </div>
  );
}

function ActivitesSuivi({ suivi, getStatus, onStatusChange }) {
  const [selectedGroup, setSelectedGroup] = useState("Groupe 1");
  const totalCases = suivi.activites.length * suivi.eleves.length;
  const doneCases = suivi.activites.reduce(
    (total, activite) => total + suivi.eleves.filter((eleve) => getStatus(activite.id, eleve.id) === "terminee").length,
    0
  );
  const supportsGroups = suivi.classe?.nom?.replace(/\s/g, "").toUpperCase() === "2TNE";
  const groups = supportsGroups ? ["Groupe 1", "Groupe 2"] : ["Classe entière"];
  const visibleEleves = supportsGroups
    ? suivi.eleves.filter((eleve) => eleve.groupe === selectedGroup)
    : suivi.eleves;
  const groupStats = groups.map((groupe) => {
    const eleves = supportsGroups
      ? suivi.eleves.filter((eleve) => eleve.groupe === groupe)
      : suivi.eleves;
    const total = eleves.length * suivi.activites.length;
    const fait = suivi.activites.reduce((sum, activite) => sum + eleves.filter((eleve) => getStatus(activite.id, eleve.id) === "terminee").length, 0);
    return { groupe, eleves, percent: total ? Math.round((fait / total) * 100) : 0 };
  });

  return (
    <div>
      <div className="grid grid-3 activity-summary">
        <div className="card"><div className="stat-value">{totalCases ? Math.round((doneCases / totalCases) * 100) : 0}%</div><div className="stat-label">Progression de la classe</div></div>
        {groupStats.map(({ groupe, eleves, percent }) => (
          <div className="card" key={groupe}><div className="stat-value">{percent}%</div><div className="stat-label">{groupe} · {eleves.length} élève(s)</div></div>
        ))}
      </div>
      {suivi.activites.length === 0 ? (
        <div className="empty-state">Aucune activité liée à cette classe.</div>
      ) : suivi.eleves.length === 0 ? (
        <div className="empty-state">Ajoutez des élèves pour commencer le suivi.</div>
      ) : (
        <div className="card activity-tracking-table">
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <p className="muted small-text" style={{ margin: 0 }}>Choisissez l’état de chaque élève : à commencer, commencée ou terminée.</p>
            {supportsGroups && (
              <div className="field" style={{ margin: 0, minWidth: 180 }}>
                <label htmlFor="activity-group-filter">Groupe à évaluer</label>
                <select id="activity-group-filter" value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
                  {groups.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
              </div>
            )}
          </div>
          {supportsGroups && visibleEleves.length === 0 ? (
            <div className="empty-state">Aucun élève affecté à ce groupe.</div>
          ) : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Activité</th>{visibleEleves.map((eleve) => <th key={eleve.id} className="student-heading">{eleve.prenom}<br /><span>{eleve.nom}</span><small>{supportsGroups ? (eleve.groupe || "Sans groupe") : "Classe entière"}</small></th>)}</tr></thead>
              <tbody>{suivi.activites.map((activite) => (
                <tr key={activite.id}>
                  <td><strong>{activite.titre}</strong><br /><span className="muted small-text">{activite.statut}</span></td>
                  {visibleEleves.map((eleve) => (
                    <td key={eleve.id} className="activity-check-cell">
                      <select className={`activity-status activity-status-${getStatus(activite.id, eleve.id)}`} value={getStatus(activite.id, eleve.id)} onChange={(event) => onStatusChange(activite.id, eleve.id, event.target.value)} aria-label={`${activite.titre} - ${eleve.prenom} ${eleve.nom}`}>
                        <option value="a_commencer">À commencer</option>
                        <option value="commencee">Commencée</option>
                        <option value="terminee">Terminée</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

function EleveModal({ classeId, onClose, onCreated }) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) return;
    await createEleve({ nom, prenom, email, classe_id: classeId });
    onCreated();
    onClose();
  };

  return (
    <Modal title="Ajouter un élève" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field"><label>Nom</label><input value={nom} onChange={(e) => setNom(e.target.value)} autoFocus /></div>
        <div className="field"><label>Prénom</label><input value={prenom} onChange={(e) => setPrenom(e.target.value)} /></div>
        <div className="field"><label>Email (optionnel)</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-primary">Ajouter</button>
        </div>
      </form>
    </Modal>
  );
}

function CoursModal({ classeId, categories, onClose, onCreated }) {
  const [titre, setTitre] = useState("");
  const [categorieId, setCategorieId] = useState(categories[0]?.id || "");
  const [objectifs, setObjectifs] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!titre.trim() || !categorieId) return;
    await createCours({ classe_id: classeId, categorie_id: Number(categorieId), titre, objectifs });
    onCreated();
    onClose();
  };

  return (
    <Modal title="Nouveau cours" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Catégorie</label>
          <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.nom}</option>)}
          </select>
        </div>
        <div className="field"><label>Titre du cours</label><input value={titre} onChange={(e) => setTitre(e.target.value)} autoFocus /></div>
        <div className="field"><label>Objectifs (optionnel)</label><textarea value={objectifs} onChange={(e) => setObjectifs(e.target.value)} /></div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-primary">Créer</button>
        </div>
      </form>
    </Modal>
  );
}

function SeanceModal({ classeId, classeName, cours, onClose, onCreated }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [heureFin, setHeureFin] = useState("10:00");
  const [coursId, setCoursId] = useState("");
  const [groupe, setGroupe] = useState("Toute la classe");
  const supportsGroups = classeName?.replace(/\s/g, "").toUpperCase() === "2TNE";

  const submit = async (e) => {
    e.preventDefault();
    const seance = await createSeance({
      classe_id: classeId, date, heure_debut: heureDebut, heure_fin: heureFin,
      cours_id: coursId || null, groupe,
    });
    onCreated();
    onClose();
    navigate(`/seances/${seance.id}`);
  };

  return (
    <Modal title="Nouvelle séance" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="grid grid-2">
          <div className="field"><label>Début</label><input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} /></div>
          <div className="field"><label>Fin</label><input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Groupe concerné</label>
          <select value={supportsGroups ? groupe : "Toute la classe"} disabled={!supportsGroups} onChange={(e) => setGroupe(e.target.value)}>
            <option value="Toute la classe">Toute la classe</option>
            <option value="Groupe 1">Groupe 1</option>
            <option value="Groupe 2">Groupe 2</option>
          </select>
        </div>
        <div className="field">
          <label>Cours associé (optionnel)</label>
          <select value={coursId} onChange={(e) => setCoursId(e.target.value)}>
            <option value="">— Aucun —</option>
            {cours.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-primary">Créer la séance</button>
        </div>
      </form>
    </Modal>
  );
}
