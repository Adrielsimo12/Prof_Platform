
import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSemaine,
  getClasses,
  getCoursList,
  createSeance,
  importPlanning,
} from "../api/resources";
import Modal from "../components/Modal";
import { exportCurrentPage } from "../utils/pdf";

/* ================================================================
   CONFIGURATION
================================================================ */

const HOURS = Array.from({ length: 6 }, (_, i) => 8 + i * 2);
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/*
 * Première semaine de cours 2026-2027.
 * Rentrée des élèves : mardi 1er septembre 2026.
 * Q1 = semaine du 31 août 2026
 * Q2 = semaine du 7 septembre 2026
 * Puis alternance Q1 / Q2.
 */
const PREMIERE_SEMAINE = "2026-08-31";
const RENTREE_ELEVES = "2026-09-01";

/* ================================================================
   EDT ANNUEL
================================================================ */

const EDT_ANNUEL = [
  /* =========================
     LUNDI
  ========================= */

  {
    jour: 0,
    debut: "08:00",
    fin: "09:00",
    titre: "CO-MATHS/PRO",
    professeur: "DEWULF M.",
    classe: "2 TNE",
    filiere: "MELEC",
    salle: "2-201 Salle SN LP",
    type: "co-intervention",
    groupe: "Q1",
  },

  {
    jour: 0,
    debut: "10:00",
    fin: "11:00",
    titre: "CO-FR/PRO",
    professeur: "POTTIER A.",
    classe: "2 TNE",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "co-intervention",
    groupe: "Q1",
  },

  {
    jour: 0,
    debut: "11:00",
    fin: "12:00",
    titre: "CO-FR/PRO",
    professeur: "POTTIER A.",
    classe: "1 CIEL",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "co-intervention",
    groupe: "Q1",
  },

  {
    jour: 0,
    debut: "13:00",
    fin: "14:00",
    titre: "CO-MATHS/PRO",
    professeur: "SANSON P.",
    classe: "1 CIEL",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "co-intervention",
    groupe: "Q1",
  },

  {
    jour: 0,
    debut: "14:00",
    fin: "18:00",
    titre: "CIEL",
    professeur: "",
    classe: "T CIEL",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "cours",
  },

  /* =========================
     MARDI
  ========================= */

  {
    jour: 1,
    debut: "14:00",
    fin: "17:00",
    titre: "TRANSITION NUMÉRIQUE ET ÉNERGÉTIQUE",
    professeur: "",
    classe: "2 TNE",
    filiere: "MELEC",
    salle: "2-201 Salle SN LP",
    type: "cours",
    groupe: "Q1",
  },

  {
    jour: 1,
    debut: "14:00",
    fin: "17:00",
    titre: "TRANSITION NUMÉRIQUE ET ÉNERGÉTIQUE",
    professeur: "",
    classe: "2 TNE",
    filiere: "MELEC",
    salle: "2-201 Salle SN LP",
    type: "cours",
    groupe: "Q2",
  },

  /* =========================
     JEUDI
  ========================= */

  {
    jour: 3,
    debut: "08:00",
    fin: "09:30",
    titre: "RÉALISATION PROJET",
    professeur: "",
    classe: "1 CIEL",
    filiere: "CIEL",
    salle: "2-208 Salle SN LP",
    type: "projet",
  },

  {
    jour: 3,
    debut: "10:00",
    fin: "11:00",
    titre: "CO-FR/PRO",
    professeur: "POTTIER A.",
    classe: "2 TNE",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "co-intervention",
    groupe: "Q1",
  },

  {
    jour: 3,
    debut: "11:00",
    fin: "12:00",
    titre: "SOUTIEN AU PARCOURS",
    professeur: "",
    classe: "T CIEL",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "soutien",
    groupe: "Q1",
  },

  {
    jour: 3,
    debut: "11:00",
    fin: "12:00",
    titre: "CO-MATHS/PRO",
    professeur: "DEWULF M.",
    classe: "2 TNE",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "co-intervention",
    groupe: "Q2",
  },

  /* =========================
     VENDREDI
  ========================= */

  {
    jour: 4,
    debut: "09:00",
    fin: "12:00",
    titre: "CIEL",
    professeur: "",
    classe: "1 CIEL",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "cours",
  },

  {
    jour: 4,
    debut: "14:00",
    fin: "15:00",
    titre: "RÉALISATION PROJET",
    professeur: "",
    classe: "T CIEL",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "projet",
  },

  {
    jour: 4,
    debut: "15:00",
    fin: "16:00",
    titre: "SOUTIEN AU PARCOURS",
    professeur: "",
    classe: "T CIEL",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "soutien",
  },

  {
    jour: 4,
    debut: "16:00",
    fin: "18:00",
    titre: "TRANSITION NUMÉRIQUE ET ÉNERGÉTIQUE",
    professeur: "",
    classe: "2 TNE",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "cours",
    groupe: "Q1",
  },

  {
    jour: 4,
    debut: "16:00",
    fin: "18:00",
    titre: "TRANSITION NUMÉRIQUE ET ÉNERGÉTIQUE",
    professeur: "",
    classe: "2 TNE",
    filiere: "CIEL",
    salle: "2-201 Salle SN LP",
    type: "cours",
    groupe: "Q2",
  },
];

/* ================================================================
   VACANCES SCOLAIRES
   ACADÉMIE DE DIJON — ZONE A
   2026-2027
================================================================ */

const VACANCES_SCOLAIRES = [
  {
    debut: "2026-10-17",
    fin: "2026-11-02",
    nom: "Toussaint",
  },
  {
    debut: "2026-12-19",
    fin: "2027-01-04",
    nom: "Noël",
  },
  {
    debut: "2027-02-13",
    fin: "2027-03-01",
    nom: "Hiver",
  },
  {
    debut: "2027-04-10",
    fin: "2027-04-26",
    nom: "Printemps",
  },
  {
    debut: "2027-07-06",
    fin: "2027-09-01",
    nom: "Été",
  },
];

/* ================================================================
   JOURS FÉRIÉS 2026-2027
================================================================ */

const JOURS_FERIES = {
  "2026-11-01": "Toussaint",
  "2026-11-11": "Armistice 1918",
  "2026-12-25": "Noël",
  "2027-01-01": "Jour de l'An",
  "2027-03-29": "Lundi de Pâques",
  "2027-05-01": "Fête du Travail",
  "2027-05-08": "Victoire 1945",
  "2027-05-06": "Ascension",
  "2027-05-17": "Lundi de Pentecôte",
  "2027-07-14": "Fête nationale",
};

/* ================================================================
   OUTILS DATE
================================================================ */

function parseDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toMonday(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;

  d.setDate(d.getDate() - day);

  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function minutesFromTime(time) {
  if (!time) return 0;

  const [h, m] = time.split(":").map(Number);

  return h * 60 + m;
}

/* ================================================================
   Q1 / Q2
================================================================ */

function getSemaineQ(date) {
  const lundi = toMonday(date);
  const premiere = parseDate(PREMIERE_SEMAINE);

  const diff =
    Math.floor(
      (lundi.getTime() - premiere.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  const numeroSemaine = Math.floor(diff / 7);

  return numeroSemaine % 2 === 0 ? "Q1" : "Q2";
}

/* ================================================================
   INFORMATIONS DU JOUR
================================================================ */

function getVacances(date) {
  const iso = isoDate(date);

  return VACANCES_SCOLAIRES.find(
    (v) => iso >= v.debut && iso < v.fin
  );
}

function getJourFerie(date) {
  return JOURS_FERIES[isoDate(date)] || null;
}

function estWeekend(date) {
  const day = date.getDay();

  return day === 0 || day === 6;
}

/* ================================================================
   COULEURS
================================================================ */

const TYPE_COLORS = {
  cours: {
    background: "#dbeafe",
    border: "#3b82f6",
    color: "#1e3a8a",
  },

  projet: {
    background: "#dcfce7",
    border: "#22c55e",
    color: "#166534",
  },

  soutien: {
    background: "#fef3c7",
    border: "#f59e0b",
    color: "#92400e",
  },

  "co-intervention": {
    background: "#ede9fe",
    border: "#8b5cf6",
    color: "#5b21b6",
  },
};

/* ================================================================
   PLANNING
================================================================ */

export default function Planning() {
  const navigate = useNavigate();
  const currentTeacher = JSON.parse(localStorage.getItem("teacher_session") || "null");
  const isAdriel = currentTeacher?.username?.toLowerCase() === "adriel";

  const [refDate, setRefDate] = useState(new Date());
  const [semaine, setSemaine] = useState(null);
  const [classes, setClasses] = useState([]);
  const [modalInfo, setModalInfo] = useState(null);
  const [creatingEdt, setCreatingEdt] = useState(false);
  const [importing, setImporting] = useState(false);

  const monday = toMonday(refDate);

  const semaineQ = getSemaineQ(monday);

  const days = Array.from(
    { length: 7 },
    (_, i) => addDays(monday, i)
  );

  /* ================================================================
     CHARGEMENT
  ================================================================ */

  const load = () => {
    getSemaine(isoDate(refDate))
      .then(setSemaine)
      .catch((err) => {
        console.error(
          "Erreur chargement semaine :",
          err
        );

        setSemaine({
          seances: [],
        });
      });
  };

  useEffect(() => {
    load();
  }, [refDate]);

  useEffect(() => {
    getClasses()
      .then(setClasses)
      .catch((err) => {
        console.error(
          "Erreur chargement classes :",
          err
        );
      });
  }, []);

  /* ================================================================
     SÉANCES EN BASE
  ================================================================ */

  const seancesFor = (day, hour) => {
    if (!semaine) return [];

    const iso = isoDate(day);

    return semaine.seances.filter((s) => {
      if (s.date !== iso || !s.heure_debut) {
        return false;
      }

      const debut = minutesFromTime(
        s.heure_debut
      );

      const slotStart = hour * 60;
      const slotEnd = (hour + 2) * 60;
      return debut >= slotStart && debut < slotEnd;
    });
  };

  /* ================================================================
     EDT
  ================================================================ */

  const edtFor = (day, hour) => {
    if (!isAdriel) return [];
    if (isoDate(day) < RENTREE_ELEVES || getVacances(day)) {
      return [];
    }

    const dayIndex =
      (day.getDay() + 6) % 7;

    return EDT_ANNUEL.filter((event) => {
      if (event.jour !== dayIndex) {
        return false;
      }

      /*
       * Si l'événement appartient à Q1/Q2,
       * on ne l'affiche que pendant la bonne semaine.
       */

      if (
        event.groupe &&
        event.groupe !== semaineQ
      ) {
        return false;
      }

      const debut =
        minutesFromTime(event.debut);

      const fin =
        minutesFromTime(event.fin);

      const slotStart = hour * 60;
      const slotEnd = (hour + 2) * 60;
      return debut >= slotStart && debut < slotEnd;
    });
  };

  const handlePlanningImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const response = await importPlanning(await file.text());
      alert(response.message || "Planning importé.");
      await load();
    } catch (error) {
      alert(error?.response?.data?.error || "Impossible d'importer ce planning CSV.");
    } finally {
      setImporting(false);
    }
  };

  const openSeance = (seance) => navigate(`/seances/${seance.id}`);

  const getClasseForEdt = (event) => {
    const name = event.classe?.toLowerCase().replace("terminale ", "").trim();
    return classes.find((classe) => classe.nom?.toLowerCase().includes(name));
  };

  const createSeanceFromEdt = async (event, day) => {
    const classe = getClasseForEdt(event);
    if (!classe) {
      alert(`La classe « ${event.classe} » n'existe pas encore dans Classes.`);
      return;
    }

    const existing = semaine?.seances?.find((seance) =>
      seance.date === isoDate(day) &&
      seance.heure_debut === event.debut &&
      seance.classe_id === classe.id
    );
    if (existing) {
      openSeance(existing);
      return;
    }

    setCreatingEdt(true);
    try {
      const cours = await getCoursList({ classe_id: classe.id });
      const linkedCourse = cours.find((item) =>
        item.titre?.toLowerCase().includes(event.titre?.toLowerCase()) ||
        event.titre?.toLowerCase().includes(item.titre?.toLowerCase())
      );
      const seance = await createSeance({
        classe_id: classe.id,
        date: isoDate(day),
        heure_debut: event.debut,
        heure_fin: event.fin,
        cours_id: linkedCourse?.id || null,
        groupe: event.groupe === "Q1" ? "Groupe 1" : event.groupe === "Q2" ? "Groupe 2" : "Toute la classe",
        contenu_realise: `${event.titre}${event.salle ? ` · ${event.salle}` : ""}`,
      });
      await load();
      openSeance(seance);
    } catch (error) {
      console.error("Erreur création séance depuis l'EDT :", error);
      alert("Impossible de créer cette séance. Vérifiez que le serveur est accessible.");
    } finally {
      setCreatingEdt(false);
    }
  };

  const hasMatchingSavedSeance = (event, day, savedSeances) => savedSeances.some((seance) => {
    const sameDate = seance.date === isoDate(day);
    const sameStart = seance.heure_debut === event.debut;
    const sameClass = seance.classe_nom?.toLowerCase().includes(event.classe?.toLowerCase().replace("terminale ", "").trim());
    return sameDate && sameStart && sameClass;
  });

  const getMatchingEdtEvent = (seance) => {
    if (!isAdriel) return null;
    if (seance.statut === "annulee" || !seance.date || !seance.heure_debut) return null;
    const day = new Date(`${seance.date}T00:00:00`);
    const dayIndex = (day.getDay() + 6) % 7;
    const seanceClass = seance.classe_nom?.toLowerCase().replace("terminale ", "").trim();

    return EDT_ANNUEL.find((event) => {
      if (event.jour !== dayIndex || event.debut !== seance.heure_debut) return false;
      if (event.groupe && event.groupe !== semaineQ) return false;
      const eventClass = event.classe?.toLowerCase().replace("terminale ", "").trim();
      return Boolean(seanceClass && eventClass && (seanceClass.includes(eventClass) || eventClass.includes(seanceClass)));
    }) || null;
  };

  const replacementsThisWeek = (semaine?.seances || []).filter(
    (seance) => seance.statut === "annulee" || !getMatchingEdtEvent(seance),
  );

  const getPlanningStatus = (seance) => {
    if (seance.statut === "annulee") return "Annulée";
    return getMatchingEdtEvent(seance) ? "Cours planifié" : "Remplacement";
  };

  /* ================================================================
     AFFICHAGE ÉVÉNEMENT
  ================================================================ */

  const eventStyle = (type) => {
    const colors =
      TYPE_COLORS[type] ||
      TYPE_COLORS.cours;

    return {
      background: colors.background,
      borderLeft: `4px solid ${colors.border}`,
      color: colors.color,
      padding: "6px 8px",
      borderRadius: "6px",
      marginBottom: "3px",
      fontSize: "11px",
      lineHeight: "1.25",
      cursor: "pointer",
      overflow: "hidden",
    };
  };

  /* ================================================================
     RENDU
  ================================================================ */

  return (
    <div className="main">

      {/* ============================================================
         HEADER
      ============================================================ */}

      <div className="page-header">

        <div>

          <span className="eyebrow">
            Emploi du temps
          </span>

          <h1>
            Planning
          </h1>

          <div className="sub">

            Semaine du{" "}
            {monday.toLocaleDateString(
              "fr-FR"
            )}

            {" "}au{" "}

            {addDays(
              monday,
              6
            ).toLocaleDateString(
              "fr-FR"
            )}

            {" • "}

            <strong>
              {semaineQ}
            </strong>

          </div>

        </div>

        <div className="toolbar">
          <button type="button" className="btn" onClick={() => exportCurrentPage(`Planning ${isoDate(monday)}`)}>Exporter PDF</button>
          <label className="btn" style={{ cursor: importing ? "wait" : "pointer" }}>
            {importing ? "Import..." : "Importer CSV"}
            <input type="file" accept=".csv,text/csv" onChange={handlePlanningImport} disabled={importing} hidden />
          </label>

          <button
            className="btn"
            onClick={() =>
              setRefDate(
                addDays(refDate, -7)
              )
            }
          >
            ←
          </button>

          <button
            className="btn"
            onClick={() =>
              setRefDate(new Date())
            }
          >
            Aujourd'hui
          </button>

          <button
            className="btn"
            onClick={() =>
              setRefDate(
                addDays(refDate, 7)
              )
            }
          >
            →
          </button>

        </div>

      </div>

      {/* ============================================================
         LÉGENDE
      ============================================================ */}

      <div className="planning-toolbar">

        <span className="planning-legend">● Cours planifié</span>
        <span className="planning-legend">＋ Remplacement</span>

        <span className="planning-legend">
          🟩 Projet
        </span>

        <span className="planning-legend">
          🟨 Soutien
        </span>

        <span className="planning-legend">
          🟪 Co-intervention
        </span>

        <span className="planning-legend">
          🔵 {semaineQ}
        </span>

        <span className="planning-legend">
          ⚪ {semaineQ === "Q1" ? "Q2" : "Q1"} semaine suivante
        </span>

      </div>

      {/* ============================================================
         PLANNING
      ============================================================ */}

      <div
        className="planning-grid"
        style={{
          fontSize: "12px",
        }}
      >

        {/* En-tête */}

        <div className="planning-head">
          Heure
        </div>

        {days.map((day, i) => {

          const vacances =
            getVacances(day);

          const ferie =
            getJourFerie(day);

          const weekend =
            estWeekend(day);

          return (

            <div
              key={i}
              className="planning-head"
              style={{
                minHeight: "48px",
                padding: "6px",
                background:
                  ferie
                    ? "#fee2e2"
                    : vacances
                    ? "#fef3c7"
                    : weekend
                    ? "#f3f4f6"
                    : undefined,
              }}
            >

              <strong>
                {JOURS[i]}
              </strong>

              {" "}

              <span className="mono">
                {day.getDate()}/
                {day.getMonth() + 1}
              </span>

              {weekend && (
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#6b7280",
                  }}
                >
                  WEEK-END
                </div>
              )}

              {ferie && (
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#dc2626",
                  }}
                >
                  FÉRIÉ · {ferie}
                </div>
              )}

              {vacances && (
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "bold",
                    color: "#92400e",
                  }}
                >
                  VACANCES
                </div>
              )}

            </div>

          );
        })}

        {/* ==========================================================
           HEURES
        ========================================================== */}

        {HOURS.map((hour) => (

          <Fragment
            key={`row-${hour}`}
          >

            <div
              className="planning-hour"
              style={{
                minHeight: "92px",
                padding: "5px",
                fontSize: "11px",
              }}
            >
              {String(hour).padStart(2, "0")}h - {String(hour + 2).padStart(2, "0")}h
            </div>

            {days.map((day, i) => {

              const events =
                seancesFor(
                  day,
                  hour
                );

              const edtEvents =
                edtFor(
                  day,
                  hour
                );

              const vacances =
                getVacances(day);

              const ferie =
                getJourFerie(day);

              const weekend =
                estWeekend(day);

              return (

                <div
                  key={`${hour}-${i}`}
                  className="planning-cell"
                  style={{
                    minHeight: "92px",
                    padding: "3px",
                    background:
                      ferie
                        ? "#fff1f2"
                        : vacances
                        ? "#fffbeb"
                        : weekend
                        ? "#f9fafb"
                        : undefined,
                  }}
                  onClick={() =>
                    setModalInfo({
                      date:
                        isoDate(day),
                      hour,
                    })
                  }
                >

                  {ferie && (
                    <div
                      style={{
                        margin: "1px 1px 4px",
                        padding: "3px 5px",
                        border: "1px solid #fca5a5",
                        borderRadius: "4px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        fontSize: "10px",
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                    >
                      JOUR FÉRIÉ · {ferie}
                    </div>
                  )}

                  {edtEvents.map(
                    (event, index) => (

                      !hasMatchingSavedSeance(event, day, events) && (

                      <div
                        key={`edt-${event.titre}-${index}`}
                        style={eventStyle(
                          event.type
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          createSeanceFromEdt(event, day);
                        }}
                      >

                        <strong>
                          {event.titre}
                        </strong>

                        <div>
                          {event.classe}
                        </div>

                        {event.professeur && (
                          <div>
                            {event.professeur}
                          </div>
                        )}

                        <small>
                          {event.debut}
                          {" – "}
                          {event.fin}
                        </small>

                        {event.groupe && (
                          <small
                            style={{
                              display:
                                "block",
                              fontWeight:
                                "bold",
                              marginTop:
                                "2px",
                            }}
                          >
                            {event.groupe}
                          </small>
                        )}

                      </div>
                      )

                    )
                  )}

                  {events.map((ev) => {
                    const planningStatus = getPlanningStatus(ev);

                    return (

                    <div
                      key={ev.id}
                      className="planning-real-event planning-added-event"
                      onClick={(e) => { e.stopPropagation(); openSeance(ev); }}
                    >

                      <strong>{ev.classe_nom}</strong>

                      <div>
                        {ev.cours_titre || ev.contenu_realise?.split(" · ")[0] || "Séance"}
                      </div>

                      <small>
                        {ev.heure_debut}
                        {" – "}
                        {ev.heure_fin}
                      </small>
                      <small className="planning-event-group">{planningStatus} · {ev.groupe || "Toute la classe"}</small>

                    </div>

                    );
                  })}

                </div>

              );
            })}

          </Fragment>

        ))}

      </div>

      <section className="planning-saved-section">
        <div className="section-title">Remplacements et séances annulées cette semaine</div>
        {!replacementsThisWeek.length ? (
          <div className="empty-state">Aucun remplacement ou séance annulée cette semaine.</div>
        ) : (
          <div className="planning-saved-list">
            {replacementsThisWeek.map((seance) => (
              <button type="button" className="planning-saved-item" key={seance.id} onClick={() => openSeance(seance)}>
                <span className="planning-saved-date">{new Date(`${seance.date}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}</span>
                <span className="planning-saved-time">{seance.heure_debut || "--:--"}{seance.heure_fin ? ` - ${seance.heure_fin}` : ""}</span>
                <span className="planning-saved-title"><strong>{seance.classe_nom}</strong><small>{getPlanningStatus(seance)} · {seance.cours_titre || seance.contenu_realise?.split(" · ")[0] || "Séance"} · {seance.groupe || "Toute la classe"}</small></span>
                <span className="planning-saved-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
         MODALE
      ============================================================ */}

      {creatingEdt && <div className="planning-creating-note">Création de la séance…</div>}

      {modalInfo && (

        <QuickSeanceModal
          info={modalInfo}
          classes={classes}
          onClose={() =>
            setModalInfo(null)
          }
          onCreated={load}
        />

      )}

    </div>
  );
}

/* ================================================================
   MODALE CRÉATION SÉANCE
================================================================ */

function QuickSeanceModal({
  info,
  classes,
  onClose,
  onCreated,
}) {

  const navigate = useNavigate();

  const edtEvent =
    info.edtEvent;

  const [classeId, setClasseId] =
    useState("");

  const [heureDebut, setHeureDebut] =
    useState(
      edtEvent?.debut ||
        `${String(
          info.hour
        ).padStart(2, "0")}:00`
    );

  const [heureFin, setHeureFin] =
    useState(
      edtEvent?.fin ||
        `${String(
          info.hour + 2
        ).padStart(2, "0")}:00`
    );

  const [coursId, setCoursId] =
    useState("");

  const [coursOptions, setCoursOptions] =
    useState([]);

  /* ================================================================
     CLASSE CORRESPONDANTE
  ================================================================ */

  useEffect(() => {

    if (!edtEvent || !classes.length) {
      return;
    }

    const nom =
      edtEvent.classe
        ?.toLowerCase()
        .replace(
          "terminale ",
          ""
        )
        .trim();

    const correspondante =
      classes.find((c) =>
        c.nom
          ?.toLowerCase()
          .includes(nom)
      );

    if (correspondante) {
      setClasseId(
        correspondante.id
      );
    }

  }, [classes, edtEvent]);

  /* ================================================================
     CLASSE PAR DÉFAUT
  ================================================================ */

  useEffect(() => {

    if (
      !classeId &&
      !edtEvent &&
      classes.length
    ) {
      setClasseId(
        classes[0].id
      );
    }

  }, [classes, classeId, edtEvent]);

  /* ================================================================
     COURS
  ================================================================ */

  useEffect(() => {

    if (!classeId) {
      setCoursOptions([]);
      return;
    }

    getCoursList({
      classe_id: classeId,
    })
      .then(setCoursOptions)
      .catch((err) => {
        console.error(
          "Erreur chargement cours :",
          err
        );

        setCoursOptions([]);
      });

  }, [classeId]);

  /* ================================================================
     CRÉATION
  ================================================================ */

  const submit = async (e) => {

    e.preventDefault();

    if (!classeId) {
      alert(
        "Veuillez sélectionner une classe."
      );
      return;
    }

    try {

      const seance =
        await createSeance({
          classe_id:
            Number(classeId),

          date:
            info.date,

          heure_debut:
            heureDebut,

          heure_fin:
            heureFin,

          cours_id:
            coursId || null,
        });

      onCreated();

      onClose();

      navigate(
        `/seances/${seance.id}`
      );

    } catch (error) {

      console.error(
        "Erreur création séance :",
        error
      );

      alert(
        "Impossible de créer la séance."
      );
    }
  };

  /* ================================================================
     RENDU
  ================================================================ */

  return (

    <Modal
      title={
        edtEvent
          ? `Nouvelle séance — ${edtEvent.titre}`
          : `Nouvelle séance — ${info.date}`
      }
      onClose={onClose}
    >

      {/* ================================
         INFORMATIONS EDT
      ================================= */}

      {edtEvent && (

        <div
          style={{
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "8px",
            background:
              "#f3f4f6",
            fontSize: "13px",
          }}
        >

          <strong>
            {edtEvent.titre}
          </strong>

          <div>
            Classe :{" "}
            {edtEvent.classe}
          </div>

          <div>
            Horaire :{" "}
            {edtEvent.debut}
            {" – "}
            {edtEvent.fin}
          </div>

          {edtEvent.professeur && (
            <div>
              Professeur :{" "}
              {edtEvent.professeur}
            </div>
          )}

          {edtEvent.salle && (
            <div>
              Salle :{" "}
              {edtEvent.salle}
            </div>
          )}

          {edtEvent.groupe && (
            <div>
              Groupe :{" "}
              <strong>
                {edtEvent.groupe}
              </strong>
            </div>
          )}

        </div>

      )}

      <form onSubmit={submit}>

        {/* CLASSE */}

        <div className="field">

          <label>
            Classe
          </label>

          <select
            value={classeId}
            onChange={(e) =>
              setClasseId(
                e.target.value
              )
            }
          >

            <option value="">
              — Sélectionner —
            </option>

            {classes.map((c) => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.nom}
              </option>

            ))}

          </select>

        </div>

        {/* HORAIRES */}

        <div className="grid grid-2">

          <div className="field">

            <label>
              Début
            </label>

            <input
              type="time"
              value={heureDebut}
              onChange={(e) =>
                setHeureDebut(
                  e.target.value
                )
              }
            />

          </div>

          <div className="field">

            <label>
              Fin
            </label>

            <input
              type="time"
              value={heureFin}
              onChange={(e) =>
                setHeureFin(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* COURS */}

        <div className="field">

          <label>
            Cours associé
          </label>

          <select
            value={coursId}
            onChange={(e) =>
              setCoursId(
                e.target.value
              )
            }
          >

            <option value="">
              — Aucun —
            </option>

            {coursOptions.map((c) => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.titre}
              </option>

            ))}

          </select>

        </div>

        {/* BOUTONS */}

        <div className="form-actions">

          <button
            type="button"
            className="btn"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Créer la séance
          </button>

        </div>

      </form>

    </Modal>
  );
}
