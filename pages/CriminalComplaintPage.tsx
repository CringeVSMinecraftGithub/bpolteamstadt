
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoliceOSWindow from '../components/PoliceOSWindow';
import { dbCollections, addDoc } from '../firebase';
import { useAuth } from '../App';

const CriminalComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    applicant: '',
    suspect: '',
    suspectDescription: '',
    violation: 'Kein Verstoß',
    incidentDetails: '',
    notes: ''
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(dbCollections.reports, {
        reportNumber: `ANZ-${Math.floor(Math.random() * 9000) + 1000}`,
        type: 'Strafanzeige',
        status: 'Offen',
        date: new Date().toISOString(),
        officerName: `${user.rank} ${user.lastName}`,
        officerBadge: user.badgeNumber,
        applicant: formData.applicant,
        suspect: formData.suspect,
        suspectDescription: formData.suspectDescription,
        description: formData.incidentDetails,
        notes: formData.notes,
        laws: [formData.violation],
        timestamp: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert("Fehler bei der Cloud-Übertragung.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PoliceOSWindow title="Strafanzeigen">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        <h1 className="text-4xl font-black text-white mb-8 border-b-4 border-blue-600 pb-2 w-fit pr-20 uppercase tracking-tighter">Strafanzeige erstellen</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-black text-slate-500 uppercase">Anzeigende Person:</label>
            <input type="text" className="w-full bg-transparent px-4 py-4 text-sm text-slate-200 outline-none" placeholder="Name des Geschädigten" value={formData.applicant} onChange={e => setFormData({...formData, applicant: e.target.value})} />
          </div>
          <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-black text-slate-500 uppercase">Beschuldigte Person:</label>
            <input type="text" className="w-full bg-transparent px-4 py-4 text-sm text-slate-200 outline-none" placeholder="Name des Täters (oder Unbekannt)" value={formData.suspect} onChange={e => setFormData({...formData, suspect: e.target.value})} />
          </div>
        </div>

        <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
          <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-black text-slate-500 uppercase">Verstoß gegen:</label>
          <select className="w-full bg-transparent px-4 py-4 text-sm text-slate-200 outline-none appearance-none" value={formData.violation} onChange={e => setFormData({...formData, violation: e.target.value})}>
            <option>§ 242 Diebstahl</option>
            <option>§ 223 Körperverletzung</option>
            <option>§ 113 Widerstand</option>
            <option>§ 303 Sachbeschädigung</option>
          </select>
        </div>

        <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
          <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-black text-slate-500 uppercase">Tatvorgang:</label>
          <textarea className="w-full h-48 bg-transparent px-4 py-6 text-sm text-slate-300 outline-none resize-none" placeholder="Detaillierte Schilderung des Tathergangs..." value={formData.incidentDetails} onChange={e => setFormData({...formData, incidentDetails: e.target.value})} />
        </div>

        <div className="flex items-center justify-between pt-6">
          <button onClick={() => navigate('/dashboard')} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">Abbrechen</button>
          <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white px-16 py-5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50">
            {isSaving ? 'Übertrage Daten...' : 'Anzeige Einreichen'}
          </button>
        </div>
      </div>
    </PoliceOSWindow>
  );
};

export default CriminalComplaintPage;
