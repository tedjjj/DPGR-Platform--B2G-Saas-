import { createContext, useContext, useState } from "react";

const DemandeContext = createContext(null);

const fallbackValue = {
  personnel: {},
  setPersonnel: () => {},
  sejour: {},
  setSejour: () => {},
  documents: {},
  setDocuments: () => {},
  additionalInfo: {},
  setAdditionalInfo: () => {},
  currentDemandeId: null,
  setCurrentDemandeId: () => {},
  resetDemande: () => {},
};

export function DemandeProvider({ children }) {
  const [personnel, setPersonnel] = useState({});
  const [sejour, setSejour] = useState({});
  const [documents, setDocuments] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState({});
  const [currentDemandeId, setCurrentDemandeId] = useState(null);

  const resetDemande = () => {
    setPersonnel({});
    setSejour({});
    setDocuments({});
    setAdditionalInfo({});
    setCurrentDemandeId(null);
  };

  const value = {
    personnel,
    setPersonnel,
    sejour,
    setSejour,
    documents,
    setDocuments,
    additionalInfo,
    setAdditionalInfo,
    currentDemandeId,
    setCurrentDemandeId,
    resetDemande,
  };

  return (
    <DemandeContext.Provider value={value}>
      {children}
    </DemandeContext.Provider>
  );
}

export function useDemande() {
  const ctx = useContext(DemandeContext);
  return ctx || fallbackValue;
}

