
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { JobApplication, IncidentReport, Permission, User, Law, CitizenSubmission } from '../types';
import { POLICE_LOGO_RAW } from '../constants';

interface DesktopApp {
  id: string;
  label: string;
  icon: string;
  path?: string;
  permission?: Permission;
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSidebarOpen, setSidebarOpen, hasPermission, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);

  // States for dynamic data in windows
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allApps, setAllApps] = useState<JobApplication[]>([]);
  const [allReports, setAllReports] = useState<IncidentReport[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<CitizenSubmission[]>([]);
  const [calcDisplay, setCalcDisplay] = useState('0');
  
  // Selection states
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<CitizenSubmission | null>(null);
  
  // Radio State
  const [radioChannel, setRadioChannel] = useState('DIGITAL-BPOL-01');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const loadData = useCallback(() => {
    setAllUsers(JSON.parse(localStorage.getItem('bpol_users') || '[]'));
    setAllApps(JSON.parse(localStorage.getItem('bpol_applications') || '[]'));
    setAllReports(JSON.parse(localStorage.getItem('bpol_incident_reports') || '[]'));
    setAllSubmissions(JSON.parse(localStorage.getItem('bpol_submissions') || '[]'));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    loadData();
    window.addEventListener('storage', loadData);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  const handleAppClick = (app: DesktopApp) => {
    if (app.path && app.path !== '#') {
      navigate(app.path);
    } else {
      setActiveWindow(app.id);
    }
  };

  const closeWindow = () => {
    setActiveWindow(null);
    setSelectedApp(null);
    setSelectedSubmission(null);
    setIsTransmitting(false);
  };

  const updateSubmissionStatus = (id: string, status: CitizenSubmission['status']) => {
    const updated = allSubmissions.map(s => s.id === id ? { ...s, status } : s);
    localStorage.setItem('bpol_submissions', JSON.stringify(updated));
    setAllSubmissions(updated);
  };

  const updateAppStatus = (id: string, status: JobApplication['status']) => {
    const updated = allApps.map(a => a.id === id ? { ...a, status } : a);
    localStorage.setItem('bpol_applications', JSON.stringify(updated));
    setAllApps(updated);
  };

  const apps: DesktopApp[] = [
    { id: 'fleet', label: 'Fuhrpark', icon: '🚓', color: 'bg-blue-500' },
    { id: 'evidence', label: 'Asservatenkammer', icon: '📦', color: 'bg-orange-500' },
    { id: 'warrants', label: 'Fahndung', icon: '🔍', color: 'bg-red-600', permission: Permission.VIEW_WARRANTS },
    { id: 'reports', label: 'Einsatzberichte', icon: '📝', color: 'bg-blue-600', permission: Permission.VIEW_REPORTS, path: '/incident-report' },
    { id: 'complaints', label: 'Strafanzeigen', icon: '⚖️', color: 'bg-slate-700', permission: Permission.CREATE_REPORTS, path: '/criminal-complaint' },
    { id: 'mail', label: 'Posteingang', icon: '📥', color: 'bg-amber-600', permission: Permission.VIEW_REPORTS },
    { id: 'personnel', label: 'Administration', icon: '⚙️', color: 'bg-indigo-600', permission: Permission.MANAGE_USERS, path: '/admin' },
    { id: 'apps', label: 'Bewerbungen', icon: '📁', color: 'bg-emerald-600', permission: Permission.MANAGE_USERS },
    { id: 'knowledge', label: 'Wissensdatenbank', icon: '📘', color: 'bg-sky-500' },
    { id: 'calendar', label: 'Kalender', icon: '📅', color: 'bg-pink-500' },
    { id: 'radio', label: 'Funk', icon: '📻', color: 'bg-gray-600' },
    { id: 'calc', label: 'Taschenrechner', icon: '🔢', color: 'bg-blue-400' },
    { id: 'units', label: 'Units', icon: '👥', color: 'bg-teal-600' },
  ];

  if (!user) return null;

  return (
    <div className="h-screen w-screen bg-[#000000] overflow-hidden flex flex-col relative font-sans select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e3a8a33,transparent)] pointer-events-none"></div>

      <main className="flex-1 p-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 auto-rows-min gap-10 z-10 overflow-y-auto custom-scrollbar">
        {apps.map((app) => {
          const allowed = app.permission ? hasPermission(app.permission) : true;
          if (!allowed && !user.isAdmin) return null;

          return (
            <button
              key={app.id}
              onClick={() => handleAppClick(app)}
              className="group flex flex-col items-center gap-2 w-24 h-28 transition-all hover:bg-white/5 rounded-xl p-2"
            >
              <div className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-black/50 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 border border-white/10`}>
                {app.icon}
              </div>
              <span className="text-[11px] font-semibold text-white text-center leading-tight drop-shadow-md group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                {app.label}
              </span>
            </button>
          );
        })}
      </main>

      {activeWindow && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col animate-in zoom-in duration-200 overflow-hidden min-h-[600px] max-h-[85vh]">
            <div className="h-12 bg-slate-900/90 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                 <span className="text-xl">{apps.find(a => a.id === activeWindow)?.icon}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                  {selectedApp ? 'Bewerbungs-Details' : selectedSubmission ? 'Anfragen-Details' : apps.find(a => a.id === activeWindow)?.label}
                 </span>
              </div>
              <div className="flex items-center gap-4">
                {(selectedApp || selectedSubmission) && (
                  <button onClick={() => { setSelectedApp(null); setSelectedSubmission(null); }} className="text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">← Zurück zur Liste</button>
                )}
                <button onClick={closeWindow} className="h-8 w-8 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all flex items-center justify-center font-bold">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#0f172a]">
              
              {activeWindow === 'mail' && (
                <>
                  {!selectedSubmission ? (
                    <div className="bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[9px] font-black uppercase text-slate-500 border-b border-white/10 bg-white/5">
                            <th className="px-8 py-5">Typ</th>
                            <th className="px-8 py-5">Betreff / Titel</th>
                            <th className="px-8 py-5">Datum</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Aktion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allSubmissions.map(s => (
                            <tr key={s.id} className="text-xs hover:bg-white/5 transition-all group">
                              <td className="px-8 py-6">
                                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${s.type === 'Hinweis' ? 'bg-amber-600/20 text-amber-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                                  {s.type}
                                </span>
                              </td>
                              <td className="px-8 py-6 font-bold text-white uppercase tracking-tight">{s.title}</td>
                              <td className="px-8 py-6 text-slate-500">{new Date(s.timestamp).toLocaleDateString('de-DE')}</td>
                              <td className="px-8 py-6">
                                <span className={`text-[9px] font-black uppercase ${s.status === 'Neu' ? 'text-blue-500' : 'text-slate-600'}`}>{s.status}</span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button onClick={() => { setSelectedSubmission(s); updateSubmissionStatus(s.id, 'Gelesen'); }} className="text-blue-500 font-black text-[9px] uppercase">Öffnen</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {allSubmissions.length === 0 && <div className="py-24 text-center opacity-20 italic text-xs uppercase tracking-widest font-black">Keine Bürgeranfragen vorhanden</div>}
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                      <div className="border-b border-white/10 pb-6">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedSubmission.title}</h2>
                        <div className="flex gap-4 mt-2">
                           <span className="text-[10px] font-black text-blue-500 uppercase">{selectedSubmission.type}</span>
                           <span className="text-[10px] font-bold text-slate-600 uppercase">{new Date(selectedSubmission.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 min-h-[200px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedSubmission.content}
                      </div>
                      <div className="flex gap-4">
                         <button onClick={() => updateSubmissionStatus(selectedSubmission.id, 'Archiviert')} className="bg-slate-800 text-slate-400 px-6 py-3 rounded-xl text-[10px] font-black uppercase">Archivieren</button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeWindow === 'apps' && (
                <>
                  {!selectedApp ? (
                    <div className="bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[9px] font-black uppercase text-slate-500 border-b border-white/10 bg-white/5">
                            <th className="px-8 py-5">Bewerber</th>
                            <th className="px-8 py-5">Laufbahn</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Aktion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allApps.map(a => (
                            <tr key={a.id} className="text-xs hover:bg-white/5 transition-all group">
                              <td className="px-8 py-6">
                                 <div className="font-black text-white uppercase">{a.name}</div>
                                 <div className="text-[9px] text-slate-500 mt-1">Alter: {a.oocAge} | Discord: {a.discordId}</div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="font-bold text-slate-400 uppercase tracking-tighter">{a.careerPath || 'Unbekannt'}</div>
                                <div className="text-[9px] text-slate-600">{a.position}</div>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1.5 rounded-lg uppercase font-black text-[9px] ${a.status === 'Eingegangen' ? 'bg-blue-600/20 text-blue-400' : 'bg-amber-600/20 text-amber-400'}`}>
                                  {a.status}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => setSelectedApp(a)} className="text-[9px] font-black text-blue-500 hover:text-white uppercase transition-colors">Prüfen</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                       <div className="flex justify-between items-start border-b border-white/10 pb-8">
                          <div>
                             <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedApp.name}</h3>
                             <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">Bewerbung für den {selectedApp.careerPath}</p>
                          </div>
                          <div className="text-right">
                             <div className="text-[9px] font-black text-slate-500 uppercase">Eingegangen am</div>
                             <div className="text-xs font-bold text-white">{new Date(selectedApp.timestamp).toLocaleString('de-DE')}</div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-8">
                             <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Personenbezogene Daten</h4>
                                <div className="grid grid-cols-2 gap-y-4 text-xs">
                                   <div><div className="text-[8px] font-black text-slate-600 uppercase">OOC Alter</div><div>{selectedApp.oocAge} Jahre</div></div>
                                   <div><div className="text-[8px] font-black text-slate-600 uppercase">IC Geburtsdatum</div><div>{selectedApp.icBirthDate}</div></div>
                                   <div><div className="text-[8px] font-black text-slate-600 uppercase">Telefonnummer</div><div>{selectedApp.icPhone}</div></div>
                                   <div><div className="text-[8px] font-black text-slate-600 uppercase">Discord ID</div><div>{selectedApp.discordId}</div></div>
                                   {selectedApp.extraField && <div className="col-span-2"><div className="text-[8px] font-black text-slate-600 uppercase">Abschluss / Qualifikation</div><div className="text-indigo-400 font-bold">{selectedApp.extraField}</div></div>}
                                </div>
                             </div>
                             <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Lebenslauf</h4>
                                <p className="text-xs text-slate-400 whitespace-pre-wrap">{selectedApp.cv}</p>
                             </div>
                          </div>
                          <div className="space-y-8">
                             <div className="bg-blue-600/5 p-8 rounded-[40px] border border-blue-600/10">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 border-b border-blue-600/10 pb-2">Motivation</h4>
                                <p className="text-xs text-slate-300 italic">"{selectedApp.motivation}"</p>
                             </div>
                             <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] grid grid-cols-2 gap-4">
                                <button onClick={() => updateAppStatus(selectedApp.id, 'Eingeladen')} className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Einladen</button>
                                <button onClick={() => updateAppStatus(selectedApp.id, 'Abgelehnt')} className="bg-red-600/20 text-red-400 border border-red-600/30 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Ablehnen</button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </>
              )}

              {/* Other window types simplified for briefness in this patch */}
              {activeWindow === 'fleet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Mercedes-Benz Vito', plate: 'TS-BP 102', status: 'Bereit', icon: '🚙', type: 'Gruppenkraftwagen' },
                    { name: 'VW Passat B8', plate: 'TS-BP 340', status: 'Im Einsatz', icon: '🚓', type: 'Streifenwagen' }
                  ].map(v => (
                    <div key={v.plate} className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                       <span className="text-5xl">{v.icon}</span>
                       <h4 className="text-xs font-black uppercase text-white">{v.name}</h4>
                       <div className="inline-block bg-white text-black font-mono font-bold px-3 py-1 rounded text-[10px]">{v.plate}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Taskbar remains similar */}
      <footer className="h-12 bg-[#0a0f1e]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-2 z-[100]">
        <div className="flex items-center gap-1 h-full">
          <button onClick={() => setIsStartMenuOpen(!isStartMenuOpen)} className={`h-10 w-10 flex items-center justify-center rounded-lg ${isStartMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <img src={POLICE_LOGO_RAW} alt="BPOL" className="h-7 w-auto" />
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
          {activeWindow && <div className="bg-blue-600/30 border border-blue-500/40 px-5 h-9 flex items-center gap-3 rounded-lg ml-1"><span className="text-lg">{apps.find(a => a.id === activeWindow)?.icon}</span><span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{apps.find(a => a.id === activeWindow)?.label}</span></div>}
        </div>
        <div className="flex items-center gap-4 h-full pr-4">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`h-10 w-10 flex items-center justify-center rounded-lg ${isSidebarOpen ? 'bg-blue-600/50' : 'hover:bg-white/10'}`}>🔔</button>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[11px] font-black text-white">{time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[8px] text-slate-500 font-black uppercase">{time.toLocaleDateString('de-DE')}</span>
          </div>
        </div>
      </footer>

      {isStartMenuOpen && (
        <>
          <div className="absolute inset-0 z-[140]" onClick={() => setIsStartMenuOpen(false)}></div>
          <div className="absolute bottom-14 left-2 w-80 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-[150] p-4">
             <div className="p-4 border-b border-white/5 mb-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black">{user.lastName[0]}</div>
                <div className="text-[10px] font-black uppercase text-white">{user.rank} {user.lastName}</div>
             </div>
             <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-4 p-4 hover:bg-red-900/20 text-red-500 rounded-2xl transition-all">🚪<span className="text-[10px] font-black uppercase tracking-[0.2em]">Abmelden</span></button>
          </div>
        </>
      )}

      <aside className={`fixed top-0 right-0 bottom-12 w-80 bg-[#0a0f1e]/95 backdrop-blur-2xl border-l border-white/10 z-[90] transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} p-6 overflow-y-auto custom-scrollbar`}>
          <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-6">Letzte Aktivitäten</div>
          <div className="space-y-4">
            {allReports.slice(0, 10).map(r => (
              <div key={r.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px]">
                <div className="text-slate-500 mb-1">{new Date(r.date).toLocaleTimeString()}</div>
                <div className="text-white font-bold">{r.type} erstellt</div>
              </div>
            ))}
          </div>
      </aside>
    </div>
  );
};

export default Dashboard;
