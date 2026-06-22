
// State management using React hooks.
import React, { useMemo, useState } from 'react';
import './SAacceuil.css';
import Acceuil from './Acceuil';
import Utulisateur from './Utulisateur';
import GrilleEvaluation from './GrilleEvaluation';
import Zone from './Zone';
import Basee from './Basee';
import Notifications from './Notifications';
import Parametre from './Parametre';

// Function: SAacceuil.
function SAacceuil() {
// State management using React hooks.
  const [activePage, setActivePage] = useState('accueil');

  const CurrentPage = useMemo(() => {
    const pages = {
      accueil: Acceuil,
      utilisateurs: Utulisateur,
      grille: GrilleEvaluation,
      zones: Zone,
      listes: Basee,
      notifications: Notifications,
      parametres: Parametre,
    };

    return pages[activePage] || Acceuil;
  }, [activePage]);

  return <CurrentPage onNavigate={setActivePage} />;
}

export default SAacceuil;
