import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard, rendreActivite } from "../api/resources";
import StatusBadge from "../components/StatusBadge";
import { exportCurrentPage } from "../utils/pdf";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  const rendre = async (activite) => {
    try {
      await rendreActivite(activite.id);
      setData((current) => current ? {
        ...current,
        activites_a_rendre: current.activites_a_rendre.filter((item) => item.id !== activite.id),
      } : current);
    } catch (error) {
      window.alert(error?.response?.data?.error || "Impossible de rendre l'activité.");
    }
  };

  useEffect(() => {
    getDashboard().then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="main">
        <p className="muted">Chargement du tableau de bord…</p>
      </div>
    );
  }

  const totalCours = data.classes.reduce((acc, c) => acc + c.nb_cours, 0);

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <span className="eyebrow">Vue d'ensemble</span>
          <h1>Tableau de bord</h1>
          <div className="sub">
            {data.classes.length} classes · {data.total_eleves} élèves · {totalCours} cours au programme
          </div>
        </div>
        <div className="toolbar print-actions">
          <button type="button" className="btn" onClick={() => exportCurrentPage("Tableau de bord")}>Exporter PDF</button>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        {data.classes.map((c) => (
          <Link key={c.id} to={`/classes/${c.id}`} style={{ textDecoration: "none" }}>
            <div className="card card-tick">
              <div className="class-name">{c.nom}</div>
              <div className="stat-value">{c.nb_eleves}</div>
              <div className="stat-label">élèves</div>
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <StatusBadge status="termine" />
                <span className="mono muted" style={{ fontSize: 12 }}>{c.cours_termines}</span>
                <StatusBadge status="en_cours" />
                <span className="mono muted" style={{ fontSize: 12 }}>{c.cours_en_cours}</span>
                <StatusBadge status="a_faire" />
                <span className="mono muted" style={{ fontSize: 12 }}>{c.cours_a_faire}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-2">
        <div>
          <div className="section-title">Séances à venir (7 jours)</div>
          <div className="card">
            {data.seances_a_venir.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Aucune séance planifiée pour l'instant.</p>
            ) : (
              <ul className="list-plain">
                {data.seances_a_venir.map((s) => (
                  <li key={s.id}>
                    <strong className="mono" style={{ fontSize: 12.5 }}>{formatDate(s.date)}</strong>
                    {" · "}
                    {s.heure_debut && <span className="muted">{s.heure_debut}</span>}
                    {" — "}
                    <Link to={`/classes/${s.classe_id}`}>{s.classe_nom}</Link>
                    {s.cours_titre && <span className="muted"> · {s.cours_titre}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="section-title">Dernières séances</div>
          <div className="card">
            {data.dernieres_seances.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Aucune séance enregistrée pour le moment.</p>
            ) : (
              <ul className="list-plain">
                {data.dernieres_seances.map((s) => (
                  <li key={s.id}>
                    <strong className="mono" style={{ fontSize: 12.5 }}>{formatDate(s.date)}</strong>
                    {" — "}
                    <Link to={`/classes/${s.classe_id}`}>{s.classe_nom}</Link>
                    {s.cours_titre && <span className="muted"> · {s.cours_titre}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="section-title">Travaux et rendus à traiter</div>
      <div className="card">
        {data.travaux_a_traiter.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Rien à traiter pour le moment.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Cours</th>
                <th>Échéance</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.travaux_a_traiter.map((t) => (
                <tr key={t.id}>
                  <td>{t.titre}</td>
                  <td className="muted">{t.cours_titre || "—"}</td>
                  <td className="mono">{t.date_rendu || "—"}</td>
                  <td><StatusBadge status={t.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-title">Activités terminées à rendre aux élèves</div>
      <div className="card">
        {!data.activites_a_rendre?.length ? (
          <p className="muted" style={{ margin: 0 }}>Aucune activité terminée par toute la classe à rendre.</p>
        ) : (
          <table>
            <thead><tr><th>Activité</th><th>Classe</th><th>État</th><th>Action</th></tr></thead>
            <tbody>
              {data.activites_a_rendre.map((activite) => (
                <tr key={activite.id}>
                  <td>{activite.titre}</td>
                  <td>{activite.classe_nom}</td>
                  <td><StatusBadge status={activite.notes_completes ? "rendu" : "a_rendre"} /></td>
                  <td>
                    <button type="button" className="btn btn-sm" disabled={!activite.notes_completes} onClick={() => rendre(activite)}>
                      Rendre aux élèves
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
