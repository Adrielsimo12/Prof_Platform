import { useEffect, useMemo, useState } from "react";
import {
  getClasses,
  getElevesDeClasse,
  getActivites,
  getEvaluationsCompetences,
} from "../api/resources";
import { exportCurrentPage } from "../utils/pdf";

const NIVEAU_LABELS = {
  0: "Non acquis",
  1: "En cours",
  2: "Partiellement acquis",
  3: "Acquis",
};

export default function Progression() {
  const [classes, setClasses] = useState([]);
  const [selectedClasseId, setSelectedClasseId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [activities, setActivities] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    getClasses().then(setClasses).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClasseId) {
      setStudents([]);
      setSelectedStudentId("");
      setActivities([]);
      setEvaluations([]);
      return;
    }

    Promise.all([
      getElevesDeClasse(selectedClasseId),
      getActivites({ classe_id: selectedClasseId }),
    ])
      .then(([eleves, activites]) => {
        setStudents(eleves);
        setActivities(activites);
        setSelectedStudentId("");
      })
      .catch(console.error);
  }, [selectedClasseId]);

  useEffect(() => {
    if (!selectedClasseId || students.length === 0) {
      setEvaluations([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const all = [];

      for (const student of students) {
        const result = await getEvaluationsCompetences({ eleve_id: student.id });
        if (!cancelled) {
          all.push(...result);
        }
      }

      if (!cancelled) {
        setEvaluations(all);
      }
    };

    load().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [selectedClasseId, students]);

  const studentRows = useMemo(() => {
    const list = selectedStudentId
      ? students.filter((student) => Number(student.id) === Number(selectedStudentId))
      : students;

    return list.map((student) => {
      const studentEvaluations = evaluations.filter(
        (item) => Number(item.eleve_id) === Number(student.id)
      );

      const activityData = activities.map((activity) => {
        const activityCompetenceIds = (activity.competences || []).map((c) => Number(c.id));
        const relevant = studentEvaluations.filter(
          (item) =>
            Number(item.activite_id) === Number(activity.id) &&
            activityCompetenceIds.includes(Number(item.competence_id))
        );

        const moyenne = relevant.length
          ? relevant.reduce((sum, item) => sum + Number(item.niveau || 0), 0) / relevant.length
          : 0;

        return {
          activityId: activity.id,
          activityTitle: activity.titre,
          progression: relevant.length ? Math.round((moyenne / 3) * 100) : 0,
          competenceCount: relevant.length,
        };
      });

      const moyenneGenerale = studentEvaluations.length
        ? studentEvaluations.reduce((sum, item) => sum + Number(item.niveau || 0), 0) /
          studentEvaluations.length
        : 0;

      return {
        student,
        activityData,
        moyenneGenerale,
        progressionGenerale: studentEvaluations.length
          ? Math.round((moyenneGenerale / 3) * 100)
          : 0,
      };
    });
  }, [activities, evaluations, selectedStudentId, students]);

  const activitySummary = useMemo(() => {
    return activities.map((activity) => {
      const activityCompetenceIds = (activity.competences || []).map((c) => Number(c.id));
      const values = evaluations.filter(
        (item) =>
          Number(item.activite_id) === Number(activity.id) &&
          activityCompetenceIds.includes(Number(item.competence_id))
      );

      const uniqueStudents = new Set(values.map((item) => Number(item.eleve_id))).size;
      const moyenne = values.length
        ? values.reduce((sum, item) => sum + Number(item.niveau || 0), 0) / values.length
        : 0;

      return {
        activityId: activity.id,
        activityTitle: activity.titre,
        moyenne,
        progression: values.length ? Math.round((moyenne / 3) * 100) : 0,
        uniqueStudents,
      };
    });
  }, [activities, evaluations]);

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">Progression</span>
          <h1>Suivi de la progression</h1>
          <div className="sub">
            Évolution par classe, élève, activité et compétence
          </div>
        </div>
        <div className="toolbar print-actions">
          <button type="button" className="btn" onClick={() => exportCurrentPage("Progression")}>Exporter PDF</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid grid-2">
          <div className="field">
            <label>Classe</label>
            <select
              value={selectedClasseId}
              onChange={(e) => setSelectedClasseId(e.target.value)}
            >
              <option value="">— Sélectionner une classe —</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Élève</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={!selectedClasseId || students.length === 0}
            >
              <option value="">Tous les élèves</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nom} {student.prenom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedClasseId ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Sélectionnez une classe pour voir la progression des élèves.
          </p>
        </div>
      ) : studentRows.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Aucun élève enregistré dans cette classe.
          </p>
        </div>
      ) : (
        <>
          <div className="section-title">Progression par élève</div>
          <div className="card" style={{ marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Activités évaluées</th>
                  <th>Moyenne générale</th>
                  <th>Progression</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map(({ student, activityData, progressionGenerale, moyenneGenerale }) => (
                  <tr key={student.id}>
                    <td>
                      <strong>
                        {student.nom} {student.prenom}
                      </strong>
                    </td>
                    <td>{activityData.filter((row) => row.competenceCount > 0).length}</td>
                    <td>
                      {moyenneGenerale > 0 ? `${moyenneGenerale.toFixed(2)} / 3` : "—"}
                    </td>
                    <td>
                      <div className="mini-progress-wrap">
                        <div className="mini-progress-bar" style={{ width: `${progressionGenerale}%` }} />
                      </div>
                      <span className="mono muted">{progressionGenerale}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-title">Progression par activité</div>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Activité</th>
                  <th>Élèves concernés</th>
                  <th>Moyenne</th>
                  <th>Progression</th>
                </tr>
              </thead>
              <tbody>
                {activitySummary.map((activity) => (
                  <tr key={activity.activityId}>
                    <td>{activity.activityTitle}</td>
                    <td>{activity.uniqueStudents}</td>
                    <td>
                      {activity.moyenne > 0 ? `${activity.moyenne.toFixed(2)} / 3` : "—"}
                    </td>
                    <td>
                      <div className="mini-progress-wrap">
                        <div className="mini-progress-bar" style={{ width: `${activity.progression}%` }} />
                      </div>
                      <span className="mono muted">{activity.progression}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
