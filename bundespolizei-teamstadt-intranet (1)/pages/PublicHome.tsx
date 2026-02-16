
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { APP_NAME, POLICE_LOGO_RAW } from '../constants';

const PublicHome: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [modalType, setModalType] = useState<'Hinweis' | 'Bewerbung' | 'Bürgerservice' | 'Prävention' | 'Login' | null>(null);
  const [appStep, setAppStep] = useState<'Selection' | 'Form'>('Selection');
  const [careerPath, setCareerPath] = useState<'Mittlerer Dienst' | 'Gehobener Dienst'>('Mittlerer Dienst');
  const [submitted, setSubmitted] = useState(false);

  // Login States
  const [badge, setBadge] = useState('Adler 51/01');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    if (login(badge, password)) {
      navigate('/dashboard');
    } else {
      setLoginError(true);
    }
  };

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    if (modalType === 'Bewerbung') {
      const apps = JSON.parse(localStorage.getItem('bpol_applications') || '[]');
      apps.push({
        id: `APP-${Date.now()}`,
        name: `${formData.get('firstname')} ${formData.get('lastname')}`,
        careerPath: careerPath,
        position: careerPath === 'Mittlerer Dienst' ? 'Polizeiobermeister-Anwärter' : 'Polizeikommissar-Anwärter',
        oocAge: formData.get('oocAge'),
        icBirthDate: formData.get('icBirthDate'),
        icPhone: formData.get('icPhone'),
        discordId: formData.get('discordId'),
        motivation: formData.get('motivation'),
        cv: formData.get('cv'),
        extraField: formData.get('extraField') || '',
        status: 'Eingegangen',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('bpol_applications', JSON.stringify(apps));
    } else {
       // Persist citizen submissions
       const submissions = JSON.parse(localStorage.getItem('bpol_submissions') || '[]');
       submissions.push({
         id: `SUB-${Date.now()}`,
         type: modalType,
         title: formData.get('subject') || formData.get('serviceType') || `${modalType}-Anfrage`,
         content: formData.get('message') || formData.get('reason') || '',
         timestamp: new Date().toISOString(),
         status: 'Neu'
       });
       localStorage.setItem('bpol_submissions', JSON.stringify(submissions));
    }

    setSubmitted(true);
    setTimeout(() => {
      setModalType(null);
      setAppStep('Selection');
      setSubmitted(false);
    }, 2000);
  };

  const newsItems = [
    { title: "Verstärkte Präsenz am Bahnhof", text: "Die Bundespolizei intensiviert die Kontrollen im Bereich des Bahnhofs Teamstadt aufgrund erhöhter Diebstahldelikte.", date: "HEUTE", category: "Presse" },
    { title: "Sicherheit am Flughafen", text: "Bitte planen Sie bei Abflügen vom Flughafen Teamstadt aktuell 30 Minuten mehr Zeit für die Sicherheitskontrollen ein.", date: "GESTERN", category: "Info" },
    { title: "Trickdiebstahl-Warnung", text: "Warnung vor der 'Zettel-Methode': Unbekannte sprechen Reisende an, um sie abzulenken und zu bestehlen.", date: "12.02.", category: "Warnung" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] pointer-events-none"></div>

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in">
          <div className={`w-full ${modalType === 'Bewerbung' ? 'max-w-3xl' : 'max-w-xl'} bg-[#0a111f] border border-white/5 rounded-3xl p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-[95vh] flex flex-col relative`}>
            
            {submitted ? (
              <div className="text-center space-y-6 animate-in zoom-in py-12">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto border border-emerald-500/20 shadow-xl">✓</div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Übermittelt</h2>
                  <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Ihre Unterlagen werden geprüft.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <button onClick={() => { setModalType(null); setAppStep('Selection'); }} className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white transition-all z-50">✕</button>

                {modalType === 'Login' ? (
                  <div className="animate-in zoom-in duration-300">
                    <div className="flex flex-col items-center mb-10 text-center">
                      <img src={POLICE_LOGO_RAW} alt="BPOL Badge" className="h-32 w-auto mb-6" />
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Intranet Gateway</h2>
                      <p className="text-blue-500 text-[9px] uppercase tracking-[0.4em] font-black mt-2">Sicherheitsüberprüfung</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                      {loginError && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">Zugriff verweigert</div>}
                      <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-white uppercase font-black tracking-widest text-sm focus:border-blue-600 outline-none" placeholder="ADLER 00/00" required />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-white outline-none focus:border-blue-600" placeholder="Passwort" required />
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">Validieren</button>
                    </form>
                  </div>
                ) : modalType === 'Bewerbung' ? (
                  <div className="flex flex-col h-full animate-in fade-in">
                    {appStep === 'Selection' ? (
                      <div className="space-y-10 py-4">
                        <div className="text-center space-y-4">
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Ihre Karriere bei der Bundespolizei</h2>
                          <p className="text-slate-400 text-sm max-w-lg mx-auto">Wählen Sie Ihre gewünschte Laufbahn aus, um detaillierte Informationen zum Ablauf und das Formular zu erhalten.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <button 
                            onClick={() => { setCareerPath('Mittlerer Dienst'); setAppStep('Form'); }}
                            className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] text-left hover:border-blue-500/50 transition-all group"
                           >
                              <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🛡️</div>
                              <h3 className="text-2xl font-black text-white uppercase mb-2">Mittlerer Dienst</h3>
                              <p className="text-xs text-slate-500 leading-relaxed italic">Praxisorientierte Ausbildung zur Polizeivollzugskraft (2.5 Jahre). Schwerpunkt: Grenzschutz & Bahnanlagen.</p>
                              <div className="mt-6 text-[10px] font-black text-blue-500 uppercase tracking-widest">Jetzt informieren & bewerben ➔</div>
                           </button>
                           <button 
                            onClick={() => { setCareerPath('Gehobener Dienst'); setAppStep('Form'); }}
                            className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] text-left hover:border-indigo-500/50 transition-all group"
                           >
                              <div className="w-16 h-16 bg-indigo-600/20 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🎓</div>
                              <h3 className="text-2xl font-black text-white uppercase mb-2">Gehobener Dienst</h3>
                              <p className="text-xs text-slate-500 leading-relaxed italic">Duales Studium (3 Jahre) zum Polizeikommissar (B.A.). Schwerpunkt: Führung & Kriminalitätsbekämpfung.</p>
                              <div className="mt-6 text-[10px] font-black text-indigo-500 uppercase tracking-widest">Jetzt informieren & bewerben ➔</div>
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="mb-6 flex items-center justify-between">
                           <button 
                            onClick={() => setAppStep('Selection')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg text-xs font-bold text-white transition-all"
                           >
                             <span>←</span> Zurück zur Auswahl
                           </button>
                           <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                             Laufbahn: {careerPath}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 overflow-hidden">
                           <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                 <h4 className="text-xs font-black text-white uppercase mb-4 tracking-widest border-b border-white/10 pb-2">Informationen</h4>
                                 <div className="text-[11px] text-slate-400 space-y-4 leading-relaxed">
                                    {careerPath === 'Mittlerer Dienst' ? (
                                      <>
                                        <p>Die Ausbildung im <span className="text-white">Mittleren Dienst</span> erfolgt an einem Bundespolizeiaus- und -fortbildungszentrum (BPOLAFZ).</p>
                                        <ul className="list-disc pl-4 space-y-2 text-[10px]">
                                          <li>Dauer: 2,5 Jahre</li>
                                          <li>Abschluss: Laufbahnprüfung</li>
                                          <li>Themen: Recht, Taktik, Sport</li>
                                        </ul>
                                      </>
                                    ) : (
                                      <>
                                        <p>Das <span className="text-white">Duale Studium</span> findet an der Hochschule des Bundes für öffentliche Verwaltung statt.</p>
                                        <ul className="list-disc pl-4 space-y-2 text-[10px]">
                                          <li>Dauer: 3 Jahre</li>
                                          <li>Abschluss: Bachelor of Arts</li>
                                          <li>Themen: Führung, Kriminalistik</li>
                                        </ul>
                                      </>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <form onSubmit={handleSubmission} className="lg:col-span-2 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-300 ml-1">Vorname <span className="text-red-500">*</span></label>
                                    <input name="firstname" required placeholder="Max" className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none" />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-300 ml-1">Nachname <span className="text-red-500">*</span></label>
                                    <input name="lastname" required placeholder="Mustermann" className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none" />
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-300 ml-1">[OOC] Alter <span className="text-red-500">*</span></label>
                                    <input name="oocAge" type="number" required placeholder="25" className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none" />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-300 ml-1">Geburtsdatum [IC] <span className="text-red-500">*</span></label>
                                    <input name="icBirthDate" type="date" required className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none [color-scheme:dark]" />
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-[11px] font-bold text-slate-300 ml-1">Telefonnummer IC <span className="text-red-500">*</span></label>
                                   <input name="icPhone" required placeholder="01234567" className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-[11px] font-bold text-slate-300 ml-1">Discord ID <span className="text-red-500">*</span></label>
                                   <input name="discordId" required placeholder="Name#0000" className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none" />
                                </div>
                              </div>

                              {careerPath === 'Gehobener Dienst' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                   <label className="text-[11px] font-bold text-slate-300 ml-1">Abitur / Studienabschluss (Notenschnitt) <span className="text-red-500">*</span></label>
                                   <input name="extraField" required placeholder="z.B. 1.8" className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-indigo-500/50 outline-none" />
                                </div>
                              )}

                              <div className="space-y-1.5">
                                 <label className="text-[11px] font-bold text-slate-300 ml-1">Motivation / Warum Bundespolizei? <span className="text-red-500">*</span></label>
                                 <textarea name="motivation" required rows={4} placeholder="Beschreiben Sie Ihre Beweggründe..." className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none resize-none"></textarea>
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-[11px] font-bold text-slate-300 ml-1">Lebenslauf / Erfahrungen <span className="text-red-500">*</span></label>
                                 <textarea name="cv" required rows={6} placeholder="Chronologische Auflistung Ihrer bisherigen Stationen..." className="w-full bg-[#08101d] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500/50 outline-none resize-none"></textarea>
                              </div>

                              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3">
                                🚀 Bewerbung für {careerPath} einreichen
                              </button>
                           </form>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center border-b border-white/5 pb-8 mb-8">
                       <div className="flex items-center gap-4">
                          <img src={POLICE_LOGO_RAW} alt="BPOL" className="h-12 w-auto" />
                          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{modalType}</h2>
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {modalType === 'Hinweis' && (
                        <form onSubmit={handleSubmission} className="space-y-6">
                          <input name="subject" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-blue-600" placeholder="Betreff" />
                          <textarea name="message" required rows={5} className="w-full bg-slate-950 border border-white/10 rounded-[32px] p-6 text-white outline-none focus:border-blue-600 resize-none" placeholder="Schilderung..."></textarea>
                          <button type="submit" className="w-full bg-blue-600 py-6 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-lg">Sicher Übermitteln</button>
                        </form>
                      )}
                      {modalType === 'Bürgerservice' && (
                        <form onSubmit={handleSubmission} className="space-y-6">
                          <select name="serviceType" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white font-bold outline-none">
                            <option>Führungszeugnis</option>
                            <option>Auskunftsersuchen</option>
                            <option>Besuchstermin</option>
                          </select>
                          <input name="name" required placeholder="Vollständiger Name" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none" />
                          <textarea name="reason" required rows={4} placeholder="Details..." className="w-full bg-slate-950 border border-white/10 rounded-[32px] p-6 text-white outline-none resize-none"></textarea>
                          <button type="submit" className="w-full bg-emerald-600 py-6 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-lg">Absenden</button>
                        </form>
                      )}
                      {modalType === 'Prävention' && (
                        <div className="space-y-4">
                           {newsItems.map((w, i) => (
                             <div key={i} className="p-6 bg-slate-950 rounded-[32px] border border-white/5">
                                <h4 className="font-black text-white uppercase text-lg mb-2">{w.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">{w.text}</p>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero & Services Sections (Bottom omitted for briefness in patch) */}
      <nav className="h-24 flex items-center justify-between px-12 backdrop-blur-xl border-b border-white/5 bg-slate-950/40">
        <div className="flex items-center gap-6">
          <img src={POLICE_LOGO_RAW} alt="BPOL Logo" className="h-16 w-auto" />
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-white uppercase">{APP_NAME}</span>
            <span className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase">Offizielles Portal</span>
          </div>
        </div>
        <button onClick={() => setModalType('Login')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all">Intranet Login</button>
      </nav>

      <section className="relative pt-32 pb-40 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-7xl lg:text-9xl font-black tracking-tighter text-white mb-10 leading-[0.85] uppercase">Sicherheit für <br/><span className="bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 bg-clip-text text-transparent">Teamstadt.</span></h1>
        <p className="text-slate-400 text-lg lg:text-xl max-w-3xl mx-auto mb-12">Offizielles Portal für Bürger, Bewerber und Einsatzkräfte.</p>
        <div className="flex justify-center gap-6">
           <button onClick={() => setModalType('Bewerbung')} className="bg-white text-slate-950 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Karriere starten</button>
           <button onClick={() => setModalType('Hinweis')} className="bg-slate-900 border border-white/5 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:border-white/20 transition-all">Meldung erstatten</button>
        </div>
      </section>

      <footer className="py-24 text-center">
         <img src={POLICE_LOGO_RAW} alt="BPOL" className="h-16 w-auto mx-auto mb-10 opacity-20 grayscale" />
         <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2024 Bundesrepublik Deutschland • Alle Rechte vorbehalten</div>
      </footer>
    </div>
  );
};

export default PublicHome;
