import { useEffect, useState } from "react";

import {
  getClasses,
  getCompetences,
  getActivites,
  createActivite,
  updateActivite,
} from "../api/resources";
import StatusBadge from "../components/StatusBadge";
import { exportCurrentPage } from "../utils/pdf";

function shorten(value, maxLength = 120) {
  const text = value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function exportActiviteToWord(activite) {
  const title = (activite?.titre || "Activité").replace(/<[^>]*>/g, "");
  const safeFileName = (activite?.titre || "activite")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "activite";

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; color: #111; padding: 32px;">
        <h1 style="font-size: 22pt; margin-bottom: 20px;">${title}</h1>
        <p><strong>Classe :</strong> ${(activite?.classe_nom || "Classe").replace(/<[^>]*>/g, "")}</p>
        <p><strong>Description :</strong> ${(activite?.description || "").replace(/<[^>]*>/g, "") || "—"}</p>
        <p><strong>Consignes :</strong></p>
        <div>${(activite?.consignes || "").replace(/<[^>]*>/g, "") || "—"}</div>
        <p><strong>Production attendue :</strong></p>
        <div>${(activite?.production_attendue || "").replace(/<[^>]*>/g, "") || "—"}</div>
        <p><strong>Compétences travaillées :</strong></p>
        <ul>
          ${(activite?.competences || [])
            .map(
              (c) => `<li>${(c.code || "").replace(/<[^>]*>/g, "")}${c.code ? " — " : ""}${(c.nom || "").replace(/<[^>]*>/g, "")}</li>`
            )
            .join("") || "<li>—</li>"}
        </ul>
        <div style="margin-top: 40px;">
          <p><strong>Nom de l’élève :</strong> ______________________________</p>
          <p><strong>Prénom :</strong> ______________________________</p>
          <p><strong>Date :</strong> ______________________________</p>
          <p><strong>Appréciation :</strong> __________________________________________</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFileName}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Activites() {

  const [classes, setClasses] =
    useState([]);

  const [competences, setCompetences] =
    useState([]);

  const [activites, setActivites] =
    useState([]);

  const [classeId, setClasseId] =
    useState("");

  const [titre, setTitre] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [consignes, setConsignes] =
    useState("");

  const [production, setProduction] =
    useState("");

  const [selectedCompetences, setSelectedCompetences] =
    useState([]);

  const [editingActiviteId, setEditingActiviteId] = useState(null);
  const [filterClasseId, setFilterClasseId] = useState("all");

  useEffect(() => {

    getClasses()
      .then(setClasses)
      .catch(console.error);

    getActivites()
      .then(setActivites)
      .catch(console.error);

  }, []);

  useEffect(() => {

    if (!classeId) {
      setCompetences([]);
      return;
    }

    getCompetences({ classe_id: classeId })
      .then(setCompetences)
      .catch(console.error);

  }, [classeId]);

  const resetForm = () => {
    setEditingActiviteId(null);
    setClasseId("");
    setTitre("");
    setDescription("");
    setConsignes("");
    setProduction("");
    setSelectedCompetences([]);
  };

  const fillFormForEdit = (activite) => {
    setEditingActiviteId(activite.id);
    setClasseId(String(activite.classe_id ?? ""));
    setTitre(activite.titre || "");
    setDescription(activite.description || "");
    setConsignes(activite.consignes || "");
    setProduction(activite.production_attendue || "");
    setSelectedCompetences((activite.competences || []).map((c) => c.id));
  };

  const toggleCompetence = (
    id
  ) => {

    setSelectedCompetences(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) => item !== id
            )
          : [...current, id]
    );
  };

  const submit = async (e) => {

    e.preventDefault();

    if (!classeId) {
      alert(
        "Sélectionnez une classe."
      );
      return;
    }

    if (!titre.trim()) {
      alert(
        "Saisissez un titre."
      );
      return;
    }

    try {

      const payload = {
        classe_id: Number(classeId),
        titre,
        description,
        consignes,
        production_attendue: production,
        competence_ids: selectedCompetences,
      };

      let saved;

      if (editingActiviteId) {
        saved = await updateActivite(editingActiviteId, payload);
        setActivites((current) =>
          current.map((item) => (item.id === saved.id ? saved : item))
        );
      } else {
        saved = await createActivite(payload);
        setActivites((current) => [
          saved,
          ...current,
        ]);
      }

      resetForm();

    } catch (error) {

      console.error(error);

      alert(
        editingActiviteId
          ? "Impossible de modifier l'activité."
          : "Impossible de créer l'activité."
      );
    }
  };

  const visibleActivites = filterClasseId === "all"
    ? activites
    : activites.filter((activite) => String(activite.classe_id) === filterClasseId);

  const activitesParClasse = classes
    .map((classe) => ({
      classe,
      activites: visibleActivites.filter((activite) => activite.classe_id === classe.id),
    }));

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">Pédagogie</span>
          <h1>Activités</h1>
          <div className="sub">{activites.length} activité(s) · {classes.length} classe(s)</div>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={() => exportCurrentPage("Activités")}>Exporter PDF</button>
          <div className="activity-filter">
            <label htmlFor="activity-class-filter">Afficher</label>
            <select id="activity-class-filter" value={filterClasseId} onChange={(e) => setFilterClasseId(e.target.value)}>
              <option value="all">Toutes les classes</option>
              {classes.map((classe) => <option key={classe.id} value={classe.id}>{classe.nom}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="activity-layout">

        {/* ========================================================
           CREATION
        ======================================================== */}

        <div className="card activity-form-card">
          <div className="activity-form-heading">
            <div>
              <span className="eyebrow">Création</span>
              <h2>{editingActiviteId ? "Modifier l'activité" : "Nouvelle activité"}</h2>
            </div>
            {editingActiviteId && <button type="button" className="btn btn-sm" onClick={resetForm}>Annuler</button>}
          </div>

          <form onSubmit={submit}>

            <div className="field"><label>Classe</label><select value={classeId} onChange={(e) => { setClasseId(e.target.value); setSelectedCompetences([]); }}><option value="">— Sélectionner —</option>{classes.map((classe) => <option key={classe.id} value={classe.id}>{classe.nom}{classe.filiere ? ` (${classe.filiere})` : ""}</option>)}</select></div>
            <div className="field"><label>Titre</label><input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex : Mise en réseau d'un système" /></div>
            <div className="grid grid-2 activity-form-fields">
              <div className="field"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <div className="field"><label>Production attendue</label><textarea value={production} onChange={(e) => setProduction(e.target.value)} /></div>
            </div>
            <div className="field"><label>Consignes</label><textarea value={consignes} onChange={(e) => setConsignes(e.target.value)} /></div>
            <div className="field"><label>Compétences <span className="field-hint">{selectedCompetences.length} sélectionnée(s)</span></label>{!classeId ? <p className="muted" style={{ fontSize: 13 }}>Sélectionnez une classe pour voir les compétences de sa filière.</p> : <div className="competence-picker">{competences.map((competence) => <label key={competence.id} className="competence-option"><input type="checkbox" checked={selectedCompetences.includes(competence.id)} onChange={() => toggleCompetence(competence.id)} /><span><strong>{competence.code}</strong><small>{competence.nom}</small></span></label>)}</div>}</div>
            <button className="btn btn-primary" type="submit">{editingActiviteId ? "Enregistrer" : "Créer l'activité"}</button>

          </form>

        </div>

        {/* ========================================================
           LISTE
        ======================================================== */}

        <div className="activity-list-panel">
          <div className="activity-list-heading"><div><span className="eyebrow">Bibliothèque</span><h2>Par classe</h2></div><span className="activity-count">{visibleActivites.length}</span></div>
          {activitesParClasse.length === 0 ? <div className="empty-state">Aucune classe disponible.</div> : activitesParClasse.map(({ classe, activites: items }) => <section className="class-activity-section" key={classe.id}>
            <div className="class-activity-heading"><div><h3>{classe.nom}</h3><span>{items.length} activité(s)</span></div><span className="class-activity-mark">{String(classe.id).padStart(2, "0")}</span></div>
            {items.length === 0 ? <div className="empty-state">Aucune activité pour le moment.</div> : <div className="activity-card-list">{items.map((activite) => <article className="activity-compact-card" key={activite.id}>
              <div className="activity-card-main"><div className="activity-card-title"><h3>{activite.titre}</h3><StatusBadge status={activite.statut} /></div><p>{shorten(activite.description || activite.consignes || "Aucun descriptif")}</p><div className="activity-card-meta"><span>{activite.competences?.length || 0} compétence(s)</span>{activite.competences?.slice(0, 4).map((competence) => <span className="competence-chip" key={competence.id}>{competence.code}</span>)}</div></div>
              <div className="activity-card-actions"><button type="button" className="btn btn-sm" onClick={() => fillFormForEdit(activite)}>Modifier</button><button type="button" className="btn btn-sm" aria-label={`Exporter ${activite.titre}`} onClick={() => exportActiviteToWord(activite)}>Exporter</button></div>
            </article>)}</div>}
          </section>)}
        </div>

      </div>

    </div>
  );
}
