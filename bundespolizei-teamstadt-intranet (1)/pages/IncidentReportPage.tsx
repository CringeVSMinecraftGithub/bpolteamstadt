
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoliceOSWindow from '../components/PoliceOSWindow';

const IncidentReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    involvedOfficers: '',
    paragraph: 'Kein Delikt',
    template: 'Keine Vorlage',
    securityLevel: 0,
    content: ''
  });

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('bpol_incident_reports') || '[]');
    const newReport = {
      id: `REP-${Date.now()}`,
      reportNumber: `REP-${Math.floor(Math.random() * 9000) + 1000}`,
      type: 'Einsatzbericht',
      status: 'Offen',
      date: reportData.date,
      officerName: 'System',
      officerBadge: 'N/A',
      location: reportData.location,
      description: reportData.content,
      laws: [reportData.paragraph]
    };
    localStorage.setItem('bpol_incident_reports', JSON.stringify([newReport, ...existing]));
    navigate('/dashboard');
  };

  return (
    <PoliceOSWindow title="Einsatzberichte">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/5 pb-4">Einsatzbericht hinzufügen</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div className="relative border border-slate-700 rounded-md focus-within:border-[#005a9e] transition-colors">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Titel:</label>
            <input 
              type="text" 
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none"
              value={reportData.title}
              onChange={e => setReportData({...reportData, title: e.target.value})}
            />
          </div>
          <div className="relative border border-slate-700 rounded-md focus-within:border-[#005a9e] transition-colors">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Datum:</label>
            <input 
              type="datetime-local" 
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none [color-scheme:dark]"
              value={reportData.date}
              onChange={e => setReportData({...reportData, date: e.target.value})}
            />
          </div>
          <div className="relative border border-slate-700 rounded-md focus-within:border-[#005a9e] transition-colors">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Einsatzort:</label>
            <input 
              type="text" 
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none"
              value={reportData.location}
              onChange={e => setReportData({...reportData, location: e.target.value})}
            />
          </div>
          <div className="relative border border-slate-700 rounded-md focus-within:border-[#005a9e] transition-colors">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Beteiligte Einsatzkräfte:</label>
            <input 
              type="text" 
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none"
              value={reportData.involvedOfficers}
              onChange={e => setReportData({...reportData, involvedOfficers: e.target.value})}
            />
          </div>
        </div>

        {/* Editor Area */}
        <div className="border border-slate-700 rounded-md overflow-hidden bg-[#1e2128]">
          <div className="flex items-center gap-1 p-2 bg-[#1a1c23] border-b border-slate-700 overflow-x-auto whitespace-nowrap scrollbar-none">
            <select className="bg-transparent border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-400 outline-none">
              <option>Paragraph</option>
            </select>
            <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
            <button className="p-1 hover:bg-white/10 rounded font-bold text-xs text-slate-300 w-6">B</button>
            <button className="p-1 hover:bg-white/10 rounded italic text-xs text-slate-300 w-6">I</button>
            <button className="p-1 hover:bg-white/10 rounded underline text-xs text-slate-300 w-6">U</button>
            <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
            <button className="p-1 hover:bg-white/10 rounded text-xs text-slate-300">🔗</button>
            <button className="p-1 hover:bg-white/10 rounded text-xs text-slate-300">🖼️</button>
            <button className="p-1 hover:bg-white/10 rounded text-xs text-slate-300">🎬</button>
            <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
            <button className="p-1 hover:bg-white/10 rounded text-xs text-slate-300">📊</button>
            <button className="p-1 hover:bg-white/10 rounded text-xs text-slate-300">💬</button>
            <button className="p-1 hover:bg-white/10 rounded text-xs text-slate-300">🔢</button>
            <button className="p-1 hover:bg-white/10 rounded text-xs text-slate-300">≡</button>
          </div>
          <textarea 
            className="w-full h-64 bg-transparent p-6 text-sm text-slate-300 outline-none resize-none leading-relaxed"
            placeholder="Schreiben Sie hier Ihren Bericht..."
            value={reportData.content}
            onChange={e => setReportData({...reportData, content: e.target.value})}
          />
        </div>

        <div className="space-y-4">
          <div className="relative border border-slate-700 rounded-md">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Vorlage:</label>
            <select className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none appearance-none">
              <option>Keine Vorlage</option>
              <option>Verkehrsunfall</option>
              <option>Festnahme</option>
            </select>
          </div>

          <div className="relative border border-slate-700 rounded-md">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Mit einem anderen Computer teilen:</label>
            <select className="w-full bg-transparent px-4 py-3 text-sm text-slate-500 outline-none appearance-none">
              <option>Nothing selected</option>
            </select>
          </div>

          <div className="relative border border-slate-700 rounded-md">
            <label className="absolute -top-2.5 left-3 bg-[#16181d] px-1 text-[10px] font-bold text-slate-500 uppercase">Sicherheitsstufe:</label>
            <input 
              type="number" 
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none"
              value={reportData.securityLevel}
              onChange={e => setReportData({...reportData, securityLevel: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <button 
            onClick={handleSave}
            className="bg-[#2d5a44]/80 hover:bg-[#2d5a44] border border-[#3e7d5d] text-emerald-400 px-8 py-3 rounded-md text-xs font-bold transition-all"
          >
            Bericht speichern
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#2d333b]/80 hover:bg-[#2d333b] border border-slate-700 text-slate-300 px-8 py-3 rounded-md text-xs font-bold transition-all"
          >
            Zurück
          </button>
        </div>
      </div>
    </PoliceOSWindow>
  );
};

export default IncidentReportPage;
