import { useEffect, useState } from "react";
import {
  getDomainesCompetences,
  importCompetences,
  exportCompetences,
  getFilieres,
  deleteCompetence,
  deleteDomaineCompetence,
} from "../api/resources";
import { exportCurrentPage } from "../utils/pdf";

const NIVEAUX = {
  0: "Non acquis",
  1: "En cours",
  2: "Partiellement acquis",
  3: "Acquis",
};

export default function Competences() {

  const currentTeacher = JSON.parse(localStorage.getItem("teacher_session") || "null");

  const [filiere, setFiliere] = useState(currentTeacher?.filiere || "CIEL");
  const [filieres, setFilieres] = useState(["CIEL", "MELEC"]);

  const [domaines, setDomaines] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [ouvert, setOuvert] =
    useState(null);
  const [importMessage, setImportMessage] = useState("");

  const changerFiliere = (event) => {
    const value = event.target.value;
    if (value === "Autre") {
      const custom = window.prompt("Nom de la nouvelle filière :", "");
      if (!custom || !custom.trim()) return;
      setFiliere(custom.trim());
      return;
    }
    setFiliere(value);
  };

  const exportCsv = async () => {
    const { filename, content } = await exportCompetences();
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const response = await importCompetences(await file.text(), filiere);
      setImportMessage(response.message);
      const data = await getDomainesCompetences({ filiere });
      setDomaines(data);
      getFilieres().then(setFilieres).catch(console.error);
    } catch (error) {
      setImportMessage(error?.response?.data?.error || "Import impossible.");
    }
  };

  const handleDeleteCompetence = async (competence) => {
    if (!window.confirm(`Supprimer la compétence "${competence.code} — ${competence.nom}" ?`)) return;
    try {
      await deleteCompetence(competence.id);
      setDomaines((current) =>
        current.map((domaine) => ({
          ...domaine,
          competences: domaine.competences?.filter((c) => c.id !== competence.id),
        }))
      );
    } catch (error) {
      alert(error?.response?.data?.error || "Impossible de supprimer cette compétence.");
    }
  };

  const handleDeleteDomaine = async (domaine, event) => {
    event.stopPropagation();
    if (!window.confirm(`Supprimer le groupe "${domaine.code} — ${domaine.nom}" et toutes ses compétences ?`)) return;
    try {
      await deleteDomaineCompetence(domaine.id);
      setDomaines((current) => current.filter((d) => d.id !== domaine.id));
    } catch (error) {
      alert(error?.response?.data?.error || "Impossible de supprimer ce groupe.");
    }
  };

  useEffect(() => {
    getFilieres().then(setFilieres).catch(console.error);
  }, []);

  useEffect(() => {

    setLoading(true);

    getDomainesCompetences({ filiere })
      .then((data) => {
        setDomaines(data);
        setOuvert(data.length > 0 ? data[0].id : null);
      })
      .catch((err) => {
        console.error(
          "Erreur chargement référentiel :",
          err
        );
      })
      .finally(() => {
        setLoading(false);
      });

  }, [filiere]);

  if (loading) {
    return (
      <div className="main">
        Chargement du référentiel...
      </div>
    );
  }

  return (
    <div className="main">

      <div className="page-header">

        <div>
          <span className="eyebrow">
            Référentiel professionnel
          </span>

          <h1>
            Compétences {filiere}
          </h1>

          <div className="sub">
            Suivi des compétences du
            {filiere}
          </div>
          <div className="toolbar">
            <select value={filieres.includes(filiere) ? filiere : "Autre"} onChange={changerFiliere} aria-label="Filière du référentiel">
              {filieres.map((f) => <option key={f} value={f}>{f}</option>)}
              <option value="Autre">Autre (nouvelle filière)</option>
            </select>
            <button type="button" className="btn" onClick={() => exportCurrentPage("Compétences")}>Exporter PDF</button>
            <button type="button" className="btn" onClick={exportCsv}>Exporter CSV</button>
            <label className="btn" style={{ cursor: "pointer" }}>Importer CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} hidden /></label>
          </div>
        </div>

      </div>

      {importMessage && <div className="success-box" style={{ marginBottom: 16 }}>{importMessage}</div>}

      {domaines.length === 0 ? (

        <div className="card">

          <h3>
            Référentiel vide
          </h3>

          <p>
            Les domaines et compétences
            de cette filière doivent
            encore être importés.
          </p>

        </div>

      ) : (

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >

          {domaines.map((domaine) => {

            const isOpen =
              ouvert === domaine.id;

            return (

              <div
                key={domaine.id}
                className="card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      setOuvert(
                        isOpen
                          ? null
                          : domaine.id
                      )
                    }
                    style={{
                      flex: 1,
                      padding: "16px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                      }}
                    >

                      <div>

                        <strong>
                          {domaine.code}
                        </strong>

                        {" — "}

                        {domaine.nom}

                      </div>

                      <span>
                        {isOpen ? "▲" : "▼"}
                      </span>

                    </div>

                  </button>

                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ margin: "0 16px" }}
                    onClick={(event) => handleDeleteDomaine(domaine, event)}
                    aria-label={`Supprimer le groupe ${domaine.code}`}
                  >
                    Supprimer le groupe
                  </button>

                </div>

                {isOpen && (

                  <div
                    style={{
                      padding:
                        "0 16px 16px",
                    }}
                  >

                    {domaine.description && (
                      <p>
                        {domaine.description}
                      </p>
                    )}

                    {domaine.competences
                      ?.length === 0 ? (

                      <div>
                        Aucune compétence.
                      </div>

                    ) : (

                      domaine.competences.map(
                        (competence) => (

                          <div
                            key={
                              competence.id
                            }
                            style={{
                              padding:
                                "12px",
                              marginTop:
                                "8px",
                              border:
                                "1px solid #e5e7eb",
                              borderRadius:
                                "8px",
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "8px",
                              }}
                            >
                              <div>
                                <strong>
                                  {
                                    competence.code
                                  }
                                </strong>

                                {" — "}

                                {
                                  competence.nom
                                }
                              </div>

                              <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => handleDeleteCompetence(competence)}
                                aria-label={`Supprimer ${competence.code}`}
                              >
                                Supprimer
                              </button>
                            </div>

                            {competence.description && (
                              <p
                                style={{
                                  margin:
                                    "6px 0 0",
                                  fontSize:
                                    "13px",
                                  color:
                                    "#6b7280",
                                }}
                              >
                                {
                                  competence.description
                                }
                              </p>
                            )}

                            {competence
                              .savoir_faires
                              ?.length > 0 && (

                              <div
                                style={{
                                  marginTop:
                                    "10px",
                                }}
                              >

                                <strong>
                                  Savoir-faire
                                </strong>

                                <ul>

                                  {competence
                                    .savoir_faires
                                    .map(
                                      (sf) => (

                                        <li
                                          key={
                                            sf.id
                                          }
                                        >
                                          {sf.code &&
                                            `${sf.code} — `}
                                          {
                                            sf.description
                                          }
                                        </li>

                                      )
                                    )}

                                </ul>

                              </div>

                            )}

                          </div>

                        )
                      )

                    )}

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
