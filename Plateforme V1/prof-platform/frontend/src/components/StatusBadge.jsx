const LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
  present: "Présent",
  absent: "Absent",
  retard: "Retard",
  rendu: "Rendu",
  a_rendre: "À rendre",
  en_retard: "En retard",
  planifiee: "Planifiée",
  annulee: "Annulée",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}
