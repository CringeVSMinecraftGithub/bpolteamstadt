
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoliceOSWindow from '../components/PoliceOSWindow';
import { dbCollections, addDoc } from '../firebase';
import { useAuth } from '../App';

const IncidentReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [reportData, setReportData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    involvedOfficers: '',
    paragraph: 'Kein Delikt',
    content: ''
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(dbCollections.reports, {
        reportNumber: `REP-${Math.floor(Math.random() * 9000) + 1000}`,
        type: 'Einsatzbericht',
        status: 'Offen',
        date: reportData.date,
        officerName: `${user.rank} ${user.lastName}`,
        officerBadge: user.badgeNumber,
        location: reportData.location,
        description: reportData.content,
        title: reportData.title,
        involvedOfficers: reportData.involvedOfficers,
        laws: [reportData.paragraph],
        timestamp: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern in der Datenbank.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PoliceOSWindow title="Einsatzberichte">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/5 pb-4">Einsatzbericht hinzufügen</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Titel:</label>
            <input type="text" className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none" value={reportData.title} onChange={e => setReportData({...reportData, title: e.target.value})} />
          </div>
          <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Datum:</label>
            <input type="datetime-local" className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none [color-scheme:dark]" value={reportData.date} onChange={e => setReportData({...reportData, date: e.target.value})} />
          </div>
          <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Einsatzort:</label>
            <input type="text" className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none" value={reportData.location} onChange={e => setReportData({...reportData, location: e.target.value})} />
          </div>
          <div className="relative border border-slate-700 rounded-md bg-[#16181d]">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Beteiligte Einsatzkräfte:</label>
            <input type="text" className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none" value={reportData.involvedOfficers} onChange={e => setReportData({...reportData, involvedOfficers: e.target.value})} />
          </div>
        </div>

        <div className="border border-slate-700 rounded-md overflow-hidden bg-[#1e2128]">
          <textarea 
            className="w-full h-80 bg-transparent p-6 text-sm text-slate-300 outline-none resize-none leading-relaxed"
            placeholder="Detaillierte Schilderung des Sachverhalts..."
            value={reportData.content}
            onChange={e => setReportData({...reportData, content: e.target.value})}
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-md text-xs font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50">
            {isSaving ? 'Wird übertragen...' : 'Bericht finalisieren'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-800 text-slate-400 px-10 py-4 rounded-md text-xs font-black uppercase tracking-widest">Abbrechen</button>
        </div>
      </div>
    </PoliceOSWindow>
  );
};

export default IncidentReportPage;
