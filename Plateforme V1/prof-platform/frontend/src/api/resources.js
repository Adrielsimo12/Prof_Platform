import client from "./client";

// ---- Classes ----
export const getClasses = () => client.get("/classes").then((r) => r.data);
export const getClasse = (id) =>
  client.get(`/classes/${id}`).then((r) => r.data);
export const createClasse = (data) =>
  client.post("/classes", data).then((r) => r.data);
export const updateClasse = (id, data) =>
  client.put(`/classes/${id}`, data).then((r) => r.data);
export const deleteClasse = (id) => client.delete(`/classes/${id}`);
export const getElevesDeClasse = (id) =>
  client.get(`/classes/${id}/eleves`).then((r) => r.data);
export const getActivitesSuivi = (id) =>
  client.get(`/classes/${id}/activites-suivi`).then((r) => r.data);
export const updateActivitesSuivi = (id, data) =>
  client.put(`/classes/${id}/activites-suivi`, data).then((r) => r.data);
export const exportEleves = (id) =>
  client.get(`/classes/${id}/eleves/export`).then((r) => r.data);
export const importEleves = (id, content) =>
  client.post(`/classes/${id}/eleves/import`, { content }).then((r) => r.data);

// ---- Categories ----
export const getCategories = () =>
  client.get("/categories").then((r) => r.data);

// ---- Eleves ----
export const createEleve = (data) =>
  client.post("/eleves", data).then((r) => r.data);
export const getEleve = (id) => client.get(`/eleves/${id}`).then((r) => r.data);
export const updateEleve = (id, data) =>
  client.put(`/eleves/${id}`, data).then((r) => r.data);
export const deleteEleve = (id) => client.delete(`/eleves/${id}`);

export const addEvaluation = (eleveId, data) =>
  client.post(`/eleves/${eleveId}/evaluations`, data).then((r) => r.data);
export const deleteEvaluation = (id) =>
  client.delete(`/eleves/evaluations/${id}`);

export const addObservation = (eleveId, data) =>
  client.post(`/eleves/${eleveId}/observations`, data).then((r) => r.data);
export const deleteObservation = (id) =>
  client.delete(`/eleves/observations/${id}`);

export const addTravail = (eleveId, data) =>
  client.post(`/eleves/${eleveId}/travaux`, data).then((r) => r.data);
export const updateTravail = (id, data) =>
  client.put(`/eleves/travaux/${id}`, data).then((r) => r.data);
export const deleteTravail = (id) => client.delete(`/eleves/travaux/${id}`);

// ---- Cours ----
export const getCoursList = (params) =>
  client.get("/cours", { params }).then((r) => r.data);
export const getCours = (id) => client.get(`/cours/${id}`).then((r) => r.data);
export const createCours = (data) =>
  client.post("/cours", data).then((r) => r.data);
export const updateCours = (id, data) =>
  client.put(`/cours/${id}`, data).then((r) => r.data);
export const deleteCours = (id) => client.delete(`/cours/${id}`);

export const uploadRessource = (coursId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client
    .post(`/cours/${coursId}/ressources`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};
export const deleteRessource = (id) => client.delete(`/ressources/${id}`);
export const downloadRessource = async (id, filename) => {
  const response = await client.get(`/ressources/${id}/telecharger`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "ressource";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// ---- Seances ----
export const getSeances = (params) =>
  client.get("/seances", { params }).then((r) => r.data);
export const getSeance = (id) =>
  client.get(`/seances/${id}`).then((r) => r.data);
export const createSeance = (data) =>
  client.post("/seances", data).then((r) => r.data);
export const updateSeance = (id, data) =>
  client.put(`/seances/${id}`, data).then((r) => r.data);
export const deleteSeance = (id) => client.delete(`/seances/${id}`);
export const updatePresences = (id, presences) =>
  client.put(`/seances/${id}/presences`, { presences }).then((r) => r.data);

// ---- Planning ----
export const getSemaine = (date) =>
  client.get("/planning/semaine", { params: { date } }).then((r) => r.data);
export const importPlanning = (content) =>
  client.post("/planning/import", { content }).then((r) => r.data);

// ---- Dashboard ----
export const getDashboard = () => client.get("/dashboard").then((r) => r.data);

// ================================================================
// REFERENTIEL CIEL
// ================================================================

// ---- Domaines de compétences ----

export const getDomainesCompetences = () =>
  client.get("/domaines-competences").then((r) => r.data);
export const importCompetences = (content) =>
  client.post("/competences/import", { content }).then((r) => r.data);

export const createDomaineCompetence = (data) =>
  client.post("/domaines-competences", data).then((r) => r.data);

// ---- Compétences ----

export const getCompetences = (params = {}) =>
  client.get("/competences", { params }).then((r) => r.data);

export const getCompetence = (id) =>
  client.get(`/competences/${id}`).then((r) => r.data);

export const createCompetence = (data) =>
  client.post("/competences", data).then((r) => r.data);

export const updateCompetence = (id, data) =>
  client.put(`/competences/${id}`, data).then((r) => r.data);

export const deleteCompetence = (id) => client.delete(`/competences/${id}`);

// ---- Savoir-faire ----

export const createSavoirFaire = (competenceId, data) =>
  client
    .post(`/competences/${competenceId}/savoir-faires`, data)
    .then((r) => r.data);

export const deleteSavoirFaire = (id) => client.delete(`/savoir-faires/${id}`);

// ================================================================
// ACTIVITES
// ================================================================

export const getActivites = (params = {}) =>
  client.get("/activites", { params }).then((r) => r.data);

export const getActivite = (id) =>
  client.get(`/activites/${id}`).then((r) => r.data);

export const createActivite = (data) =>
  client.post("/activites", data).then((r) => r.data);

export const updateActivite = (id, data) =>
  client.put(`/activites/${id}`, data).then((r) => r.data);
export const rendreActivite = (id) =>
  client.post(`/activites/${id}/rendre`).then((r) => r.data);

export const deleteActivite = (id) => client.delete(`/activites/${id}`);

// ---- Teachers ----
export const getTeachers = () =>
  client.get("/teachers").then((r) => r.data.teachers);
export const createTeacher = (data) =>
  client.post("/teachers", data).then((r) => r.data);
export const updateTeacherPassword = (id, password) =>
  client.put(`/teachers/${id}/password`, { password }).then((r) => r.data);
export const deleteTeacher = (id) => client.delete(`/teachers/${id}`);
export const getPendingTeachers = () =>
  client.get("/teachers/pending").then((r) => r.data.teachers);
export const approveTeacher = (id, role) =>
  client.post(`/teachers/${id}/approve`, { role }).then((r) => r.data);

// ================================================================
// EVALUATIONS PAR COMPETENCES
// ================================================================

export const getEvaluationsCompetences = (params = {}) =>
  client
    .get("/evaluations-competences", {
      params,
    })
    .then((r) => r.data);

export const createEvaluationCompetence = (data) =>
  client.post("/evaluations-competences", data).then((r) => r.data);

export const updateEvaluationCompetence = (id, data) =>
  client.put(`/evaluations-competences/${id}`, data).then((r) => r.data);

export const deleteEvaluationCompetence = (id) =>
  client.delete(`/evaluations-competences/${id}`);
export const getAppreciations = () =>
  client.get("/appreciations").then((r) => r.data);

// ---- Messagerie ----
export const getMessageUsers = () => client.get("/messages/users").then((r) => r.data);
export const getMessages = (userId) => client.get(`/messages/${userId}`).then((r) => r.data);
export const sendMessage = (userId, contenu, file) => {
  const formData = new FormData();
  formData.append("contenu", contenu || "");
  if (file) formData.append("fichier", file);
  return client.post(`/messages/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
export const downloadMessageFile = async (messageId, filename) => {
  const response = await client.get(`/messages/${messageId}/fichier`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "piece-jointe";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const getEvaluationActivite = (params = {}) =>
  client.get("/evaluations-activites", { params }).then((r) => r.data);
export const saveEvaluationActivite = (data) =>
  client.post("/evaluations-activites", data).then((r) => r.data);
