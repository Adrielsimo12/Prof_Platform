import { useEffect, useState } from "react";
import {
  getDomainesCompetences,
  importCompetences,
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
  const filiere = currentTeacher?.filiere || "CIEL";

  const [domaines, setDomaines] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [ouvert, setOuvert] =
    useState(null);
  const [importMessage, setImportMessage] = useState("");

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const response = await importCompetences(await file.text());
      setImportMessage(response.message);
      const data = await getDomainesCompetences();
      setDomaines(data);
    } catch (error) {
      setImportMessage(error?.response?.data?.error || "Import impossible.");
    }
  };

  useEffect(() => {

    getDomainesCompetences()
      .then((data) => {
        setDomaines(data);
        if (data.length > 0) {
          setOuvert(data[0].id);
        }
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

  }, []);

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
            <button type="button" className="btn" onClick={() => exportCurrentPage("Compétences")}>Exporter PDF</button>
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
                    width: "100%",
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

                            <strong>
                              {
                                competence.code
                              }
                            </strong>

                            {" — "}

                            {
                              competence.nom
                            }

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
