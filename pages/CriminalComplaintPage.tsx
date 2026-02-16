
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoliceOSWindow from '../components/PoliceOSWindow';

const CriminalComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    applicant: '',
    suspect: '',
    suspectDescription: '',
    officer: 'System Assistent',
    status: 'Unbearbeitet',
    securityLevel: 0,
    violation: 'Kein Verstoß',
    incidentDetails: '',
    notes: ''
  });

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('bpol_incident_reports') || '[]');
    const newReport = {
      id: `ANZ-${Date.now()}`,
      reportNumber: `ANZ-${Math.floor(Math.random() * 9000) + 1000}`,
      type: 'Strafanzeige',
      status: 'Offen',
      date: new Date().toISOString(),
      officerName: formData.officer,
      officerBadge: 'N/A',
      location: 'N/A',
      description: formData.incidentDetails,
      laws: [formData.violation]
    };
    localStorage.setItem('bpol_incident_reports', JSON.stringify([newReport, ...existing]));
    navigate('/dashboard');
  };

  return (
    <PoliceOSWindow title="Strafanzeigen">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold text-white mb-8 border-b-2 border-[#005a9e] pb-2 w-fit pr-12">Strafanzeige erstellen</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          <div className="space-y-4">
            <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50 focus-within:border-[#005a9e] transition-colors">
              <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Anzeige von :</label>
              <input 
                type="text" 
                placeholder="Gebe ein Namen ein und wähle aus der untenstehende liste die Person aus."
                className="w-full bg-transparent px-4 py-4 text-xs text-slate-400 outline-none italic"
                value={formData.applicant}
                onChange={e => setFormData({...formData, applicant: e.target.value})}
              />
            </div>
            <div className="p-3 bg-blue-900/10 border border-blue-900/20 rounded text-[10px] text-slate-400 font-medium">
              Hier stehen die Suchergebnisse .
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50 focus-within:border-[#005a9e] transition-colors">
              <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Täter :</label>
              <input 
                type="text" 
                placeholder="Gebe ein Namen ein und wähle aus der untenstehende liste die Person aus."
                className="w-full bg-transparent px-4 py-4 text-xs text-slate-400 outline-none italic"
                value={formData.suspect}
                onChange={e => setFormData({...formData, suspect: e.target.value})}
              />
            </div>
            <div className="p-3 bg-blue-900/10 border border-blue-900/20 rounded text-[10px] text-slate-400 font-medium">
              Hier stehen die Suchergebnisse oder Täter Unbekannt.
            </div>
          </div>
        </div>

        <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50 focus-within:border-[#005a9e] transition-colors">
          <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Täter Beschreibung:</label>
          {/* Fix: Avoid escaped double quotes in attributes to prevent TSX parser confusion */}
          <textarea 
            placeholder="Beschreibung des Unbekannten Täters, wenn bei Täter 'Täter unbekannt' ausgewählt wurde"
            className="w-full bg-transparent px-4 py-6 text-xs text-slate-400 outline-none resize-none h-24 italic"
            value={formData.suspectDescription}
            onChange={e => setFormData({...formData, suspectDescription: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Bearbeitender Officer</label>
            <input 
              type="text" 
              readOnly
              className="w-full bg-transparent px-4 py-4 text-xs text-slate-400 outline-none"
              value={formData.officer}
            />
          </div>
          <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Status</label>
            <select 
              className="w-full bg-transparent px-4 py-4 text-xs text-slate-300 outline-none appearance-none"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option>Unbearbeitet</option>
              <option>In Prüfung</option>
              <option>Abgeschlossen</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Sicherheitsstufe</label>
            <select 
              className="w-full bg-transparent px-4 py-4 text-xs text-slate-300 outline-none appearance-none"
              value={formData.securityLevel}
              onChange={e => setFormData({...formData, securityLevel: parseInt(e.target.value)})}
            >
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </div>
          <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Verstoß gegen:</label>
            <select 
              className="w-full bg-transparent px-4 py-4 text-xs text-slate-300 outline-none appearance-none"
              value={formData.violation}
              onChange={e => setFormData({...formData, violation: e.target.value})}
            >
              <option>Kein Verstoß</option>
              <option>§ 242 Diebstahl</option>
              <option>§ 223 Körperverletzung</option>
            </select>
          </div>
        </div>

        <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50 focus-within:border-[#005a9e] transition-colors">
          <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Tatvorgang:</label>
          <textarea 
            placeholder="Beschreibung des Tatvorgangs."
            className="w-full bg-transparent px-4 py-6 text-xs text-slate-400 outline-none resize-none h-32 italic"
            value={formData.incidentDetails}
            onChange={e => setFormData({...formData, incidentDetails: e.target.value})}
          />
        </div>

        <div className="relative border border-slate-700 rounded-md bg-[#1e2128]/50 focus-within:border-[#005a9e] transition-colors">
          <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Notizen:</label>
          <textarea 
            placeholder="Hier kannst du deine Notizen einarbeiten."
            className="w-full bg-transparent px-4 py-6 text-xs text-slate-400 outline-none resize-none h-24 italic"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="flex items-center justify-between pt-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#5a2d2d]/30 hover:bg-[#5a2d2d]/50 border border-red-900/50 text-red-500 px-12 py-3 rounded-md text-[10px] font-bold uppercase transition-all"
          >
            Abbrechen
          </button>
          <button 
            onClick={handleSave}
            className="bg-[#2d5a44]/80 hover:bg-[#2d5a44] border border-[#3e7d5d] text-emerald-400 px-12 py-3 rounded-md text-[10px] font-bold uppercase transition-all shadow-lg"
          >
            Speichern
          </button>
        </div>
      </div>
    </PoliceOSWindow>
  );
};

export default CriminalComplaintPage;
