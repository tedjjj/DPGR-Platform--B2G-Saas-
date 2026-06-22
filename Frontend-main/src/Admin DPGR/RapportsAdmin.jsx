
// Side effect hook for handling data or state updates.
import React, { useState, useEffect } from 'react';
import api from '../api/AdminDPGR'; 

// On récupère "onViewDetail" dans les props pour faire le lien avec AdminDash
// Main component exported: RapportsAdmin.
export default function RapportsAdmin({ onViewDetail }) {
// State management using React hooks.
  const [rapports, setRapports] = useState([]);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState(null);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const fetchRapports = async () => {
      try {
        setLoading(true);
        // 1. On utilise l'API des demandes existante pour ne pas toucher au backend
        const res = await api.demandes.list();
        
        // 2. Gérer la structure de la réponse (Django)
        const data = res.data || res.results || res || [];

        // 3. On filtre pour ne garder que les demandes qui nécessitent un rapport 
        // (tu peux ajuster les statuts selon tes besoins exacts)
        const demandesAvecRapport = Array.isArray(data) 
          ? data.filter(d => ["APPROUVEE", "CLOTUREE"].includes(d.statut))
          : [];
          
        setRapports(demandesAvecRapport);
      } catch (err) {
        console.error("Erreur lors de la récupération des rapports:", err);
        setError("Impossible de charger les rapports.");
      } finally {
        setLoading(false);
      }
    };

    fetchRapports();
  }, []);

// Render the component JSX.
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '4px', height: '24px', backgroundColor: '#C9A84C', marginRight: '12px', borderRadius: '2px' }}></div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a2332', margin: 0 }}>
          Gestion des Rapports de Stage
        </h2>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Chargement des rapports...</div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : rapports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Aucun rapport soumis pour le moment.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Chercheur</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Référence Demande</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Destination</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Statut</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rapports.map((demande) => (
                <tr key={demande.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  
                  <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#1a2332', fontWeight: 500 }}>
                    {demande.chercheur_nom} {demande.chercheur_prenom}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#6b7280' }}>
                    {demande.numero_demande || `Demande #${demande.id}`}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#6b7280' }}>
                    {demande.destination || '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      background: demande.statut === 'CLOTUREE' ? '#dcfce7' : '#fef3c7',
                      color: demande.statut === 'CLOTUREE' ? '#16a34a' : '#d97706',
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600
                    }}>
                      {demande.statut}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => onViewDetail && onViewDetail(demande.id)}
                      style={{
                        background: 'none', border: 'none', color: '#1A3A6B',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                    }}>
                      Examiner
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
