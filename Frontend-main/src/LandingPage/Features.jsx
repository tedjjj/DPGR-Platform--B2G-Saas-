import "./PAGE1.css"


const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: "Infrastructure moderne",
    description: "Bâtiments équipés de dernières technologies pour un environnement de travail optimal.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: "Documentation complète",
    description: "Guides détaillés et formulaires pour faciliter la soumission de vos demandes.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    title: "Suivi en temps réel",
    description: "Accédez à l'état de votre demande à tout moment via notre plateforme.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: "Évaluation rigoureuse",
    description: "Processus d'évaluation transparent et basé sur des critères précis.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Support client",
    description: "Équipe dédiée pour répondre à vos questions et vous aider à chaque étape.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Planification flexible",
    description: "Choisissez la date et la durée de votre séjour en fonction de vos besoins.",
  },
];

// Function: Features.
function Features(){
// Render the component JSX.
    return(
         <section className="features">
       <p className="features-tag">Caractéristiques Clés</p>
       <h2 className="features-title">Découvrez nos fonctionnalités</h2>
       <div className="features-tag-line" />
       <div className="features-grid">
         {FEATURES.map(({ icon, title, description }) => (
         <div className="feature-card" key={title}>
           <div className="feature-card-blob" />
           <div className="feature-icon">{icon}</div>
           <h3>{title}</h3>
           <p>{description}</p>
         </div>
         ))}
       </div>
      </section>




    )
}


export default Features ;
