import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getClasses, getCategories, getCoursList } from "../api/resources";
import StatusBadge from "../components/StatusBadge";
import { exportCurrentPage } from "../utils/pdf";

export default function Cours() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cours, setCours] = useState([]);
  const [classeFilter, setClasseFilter] = useState("");

  useEffect(() => {
    getClasses().then(setClasses);
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    getCoursList(classeFilter ? { classe_id: classeFilter } : {}).then(setCours);
  }, [classeFilter]);

  const progressionParClasse = classes
    .filter((c) => !classeFilter || String(c.id) === String(classeFilter))
    .map((c) => {
      const items = cours.filter((x) => x.classe_id === c.id);
      const termine = items.filter((x) => x.statut === "termine").length;
      const enCours = items.filter((x) => x.statut === "en_cours").length;
      const pct = items.length ? Math.round((termine / items.length) * 100) : 0;
      return { classe: c, total: items.length, termine, enCours, pct };
    });

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">Programme</span>
          <h1>Cours &amp; progression</h1>
          <div className="sub">{cours.length} cours au total</div>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={() => exportCurrentPage("Cours et progression")}>Exporter PDF</button>
          <select style={{ width: 200 }} value={classeFilter} onChange={(e) => setClasseFilter(e.target.value)}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
      </div>

      <div className="section-title">Suivi de progression</div>
      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        {progressionParClasse.map(({ classe, total, termine, enCours, pct }) => (
          <div key={classe.id} className="card">
            <div className="class-name">{classe.nom}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span className="stat-value" style={{ fontSize: 24 }}>{pct}%</span>
              <span className="muted" style={{ fontSize: 12 }}>terminé ({termine}/{total})</span>
            </div>
            <div style={{ height: 6, background: "var(--line-soft)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--green)" }} />
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{enCours} en cours</div>
          </div>
        ))}
      </div>

      <div className="section-title">Détail par catégorie</div>
      {categories.map((cat) => {
        const items = cours.filter((c) => c.categorie_id === cat.id);
        return (
          <div key={cat.id} style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 8 }}>
              <span className="cat-chip">{cat.code}</span> — {cat.nom}
            </div>
            {items.length === 0 ? <div className="empty-state">Aucun cours dans cette catégorie pour le moment.</div> : <div className="card"><table>
                <thead>
                  <tr><th>Titre</th><th>Classe</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="row-link" onClick={() => navigate(`/cours/${c.id}`)}>
                      <td>{c.titre}</td>
                      <td className="muted">{c.classe_nom}</td>
                      <td><StatusBadge status={c.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>}
          </div>
        );
      })}

      <div className="section-title">Classes disponibles</div>
      <div className="grid grid-3">
        {classes.map((classe) => {
          const nombreCours = cours.filter((item) => item.classe_id === classe.id).length;
          return (
            <Link key={classe.id} to={`/classes/${classe.id}`} style={{ textDecoration: "none" }}>
              <div className="card">
                <div className="class-name">{classe.nom}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {nombreCours} cours associé(s)
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {cours.length === 0 && (
        <div className="empty-state">
          Aucun cours pour l'instant. Rendez-vous dans une <Link to="/classes">classe</Link> pour en créer un.
        </div>
      )}
    </div>
  );
}
