import { useEffect, useState } from "react";
import { downloadMessageFile, getMessageUsers, getMessages, sendMessage } from "../api/resources";

export default function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [fichier, setFichier] = useState(null);
  const [error, setError] = useState("");

  const loadMessages = async (userId = selectedUserId) => {
    if (!userId) return setMessages([]);
    setMessages(await getMessages(userId));
  };

  useEffect(() => {
    getMessageUsers().then((items) => {
      setUsers(items);
      if (items.length) setSelectedUserId(String(items[0].id));
    }).catch((err) => setError(err?.response?.data?.error || "Impossible de charger les utilisateurs."));
  }, []);

  useEffect(() => {
    loadMessages();
  }, [selectedUserId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedUserId || (!contenu.trim() && !fichier)) return;
    try {
      const message = await sendMessage(selectedUserId, contenu, fichier);
      setMessages((current) => [...current, message]);
      setContenu("");
      setFichier(null);
      event.target.reset();
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible d'envoyer le message.");
    }
  };

  const download = async (message) => {
    try {
      await downloadMessageFile(message.id, message.nom_fichier);
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible de télécharger la pièce jointe.");
    }
  };

  const selectedUser = users.find((user) => String(user.id) === String(selectedUserId));

  return (
    <div className="main">
      <div className="page-header"><div><span className="eyebrow">Communication</span><h1>Messagerie</h1><div className="sub">Dialoguer avec les utilisateurs de la plateforme</div></div></div>
      {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="card" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 220px) minmax(0, 1fr)", gap: 20, minHeight: 520 }}>
        <div>
          <div className="card-title">Utilisateurs</div>
          {users.map((user) => <button key={user.id} type="button" className="btn" style={{ display: "block", width: "100%", marginTop: 8, textAlign: "left", background: String(user.id) === String(selectedUserId) ? "#eef2f6" : undefined }} onClick={() => setSelectedUserId(String(user.id))}>{user.nom || user.username}<small style={{ display: "block" }}>{user.role}</small></button>)}
          {!users.length && <p className="muted">Aucun autre utilisateur.</p>}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-title">Conversation avec {selectedUser?.nom || selectedUser?.username || "..."}</div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
            {messages.map((message) => <div key={message.id} style={{ marginBottom: 12, padding: 10, background: "#f4f6f8", borderRadius: 6 }}><div>{message.contenu}</div>{message.nom_fichier && <button type="button" className="btn btn-sm" onClick={() => download(message)}>Télécharger · {message.nom_fichier}</button>}<small className="muted" style={{ display: "block" }}>{new Date(message.envoye_le).toLocaleString("fr-FR")}</small></div>)}
            {!messages.length && <p className="muted">Aucun message dans cette conversation.</p>}
          </div>
          <form onSubmit={submit}><textarea value={contenu} onChange={(event) => setContenu(event.target.value)} placeholder="Votre message" rows="3" style={{ width: "100%" }} /><div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}><input type="file" onChange={(event) => setFichier(event.target.files?.[0] || null)} /><button type="submit" className="btn btn-primary" disabled={!selectedUserId}>Envoyer</button></div></form>
        </div>
      </div>
    </div>
  );
}