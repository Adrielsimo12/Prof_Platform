import { useState } from "react";
import client from "../api/client";

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", nom: "", email: "", filiere: "CIEL", password: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredUsername, setRegisteredUsername] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await client.post("/login", {
        username,
        password,
      });

      localStorage.setItem("teacher_session", JSON.stringify(response.data.user));
      onLoginSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        "Impossible de contacter le serveur. Vérifiez que la plateforme est démarrée sur le PC serveur."
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await client.post("/register", form);
      setRegisteredUsername(form.username);
      setMode("verify");
      if (response.data?.verification_code) {
        const message = `Le mail n'a pas pu être envoyé. Votre code de validation est : ${response.data.verification_code}`;
        window.alert(message);
        setError(message);
      } else {
        setError("");
      }
    } catch (err) {
      if (err?.response?.data?.verification_code) {
        const message = `Le mail n'a pas pu être envoyé. Votre code de validation est : ${err.response.data.verification_code}`;
        window.alert(message);
        setRegisteredUsername(form.username);
        setMode("verify");
        setError(message);
        return;
      }
      if (err?.response?.status === 409) {
        setRegisteredUsername(form.username);
        setMode("verify");
        setError("Ce compte existe déjà. Vous pouvez demander un nouveau code de validation.");
        return;
      }
      setError(err?.response?.data?.error || "Impossible de créer le compte.");
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await client.post("/verify-email", { username: registeredUsername, code: verificationCode });
      setError(response.data?.message || "Email validé. Le compte attend l'approbation.");
      setMode("login");
    } catch (err) {
      setError(err?.response?.data?.error || "Code invalide.");
    }
  };

  const resendVerification = async () => {
    setError("");
    try {
      const response = await client.post("/resend-verification", { username: registeredUsername });
      if (response.data?.verification_code) {
        const message = `Le mail n'a pas pu être envoyé. Votre nouveau code de validation est : ${response.data.verification_code}`;
        window.alert(message);
        setError(message);
      } else {
        setError(response.data?.message || "Code renvoyé.");
      }
    } catch (err) {
      if (err?.response?.data?.verification_code) {
        const message = `Le mail n'a pas pu être envoyé. Votre code de validation est : ${err.response.data.verification_code}`;
        window.alert(message);
        setError(message);
        return;
      }
      setError(err?.response?.data?.error || "Impossible de renvoyer le code.");
    }
  };

  return (
    <div className="main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: 420, maxWidth: "90vw" }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <span className="eyebrow">Accès enseignant</span>
            <h1>Connexion</h1>
          </div>
        </div>

        {mode === "login" && <form onSubmit={submit} autoComplete="off">
          <div className="field">
            <label>Nom d'utilisateur</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre identifiant"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label>Mot de passe</label>
            <div className="password-field">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" autoComplete="current-password" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)}>{showPassword ? "Masquer" : "Afficher"}</button>
            </div>
          </div>

          {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => { setMode("register"); setError(""); }}>Créer un compte</button>
        </form>}

        {mode === "register" && <form onSubmit={register} autoComplete="off">
          <div className="field"><label>Nom complet</label><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
          <div className="field"><label>Identifiant</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="field"><label>Filière</label><input value={form.filiere} onChange={(e) => setForm({ ...form, filiere: e.target.value })} required /></div>
          <div className="field"><label>Mot de passe</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button type="submit" className="btn btn-primary">Créer le compte</button>
          <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => setMode("login")}>Retour</button>
        </form>}

        {mode === "verify" && <form onSubmit={verify}>
          <p>Un code a été envoyé à votre adresse email.</p>
          <div className="field"><label>Identifiant du compte</label><input value={registeredUsername} onChange={(e) => setRegisteredUsername(e.target.value)} required /></div>
          <div className="field"><label>Code de validation</label><input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} inputMode="numeric" required /></div>
          <button type="submit" className="btn btn-primary">Valider l'email</button>
          <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={resendVerification}>Renvoyer le code</button>
        </form>}
      </div>
    </div>
  );
}
