
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../App';
import { Role, Permission, User, Law } from '../types';
import { POLICE_LOGO_RAW } from '../constants';

const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<'Users' | 'Roles' | 'Laws'>('Users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Search & Filter state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('Alle');
  const [lawSearchTerm, setLawSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' }>({ key: 'lastName', direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(['name', 'badge', 'role', 'actions']));

  // Role Permissions State
  const [roleDefaults, setRoleDefaults] = useState<Record<Role, Permission[]>>(() => {
    const saved = localStorage.getItem('bpol_role_defaults');
    if (saved) return JSON.parse(saved);
    return {
      [Role.GE]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS],
      [Role.K]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.VIEW_WARRANTS],
      [Role.DGL]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.VIEW_WARRANTS, Permission.MANAGE_WARRANTS],
      [Role.DSL]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.DELETE_REPORTS, Permission.VIEW_WARRANTS, Permission.MANAGE_WARRANTS],
      [Role.HD]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.DELETE_REPORTS, Permission.VIEW_WARRANTS, Permission.MANAGE_WARRANTS, Permission.MANAGE_USERS, Permission.MANAGE_LAWS],
      [Role.LS]: Object.values(Permission),
    };
  });

  // Users State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bpol_users');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'admin-1',
        firstName: 'Thomas',
        lastName: 'Mueller',
        rank: 'Bundespolizeipräsident',
        badgeNumber: 'Adler 51/01',
        role: Role.LS,
        isAdmin: true,
        permissions: Object.values(Permission)
      }
    ];
  });

  // Laws State
  const [laws, setLaws] = useState<Law[]>([]);
  const [newLaw, setNewLaw] = useState({ paragraph: '', title: '', description: '' });

  useEffect(() => {
    localStorage.setItem('bpol_role_defaults', JSON.stringify(roleDefaults));
  }, [roleDefaults]);

  useEffect(() => {
    localStorage.setItem('bpol_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const savedLaws = JSON.parse(localStorage.getItem('bpol_laws') || '[]');
    if (savedLaws.length === 0) {
      const defaultLaws = [
        { id: '1', paragraph: '§ 242 StGB', title: 'Diebstahl' },
        { id: '2', paragraph: '§ 223 StGB', title: 'Körperverletzung' },
        { id: '3', paragraph: '§ 113 StGB', title: 'Widerstand gegen Vollstreckungsbeamte' },
        { id: '4', paragraph: '§ 303 StGB', title: 'Sachbeschädigung' },
        { id: '5', paragraph: '§ 263 StGB', title: 'Betrug' },
      ];
      localStorage.setItem('bpol_laws', JSON.stringify(defaultLaws));
      setLaws(defaultLaws);
    } else {
      setLaws(savedLaws);
    }
  }, []);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let result = users.filter(u => {
      const matchesSearch = 
        u.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.badgeNumber.toLowerCase().includes(userSearchTerm.toLowerCase());
      const matchesRole = userRoleFilter === 'Alle' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });

    result.sort((a, b) => {
      const aVal = String(a[sortConfig.key]);
      const bVal = String(b[sortConfig.key]);
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    return result;
  }, [users, userSearchTerm, userRoleFilter, sortConfig]);

  const filteredLaws = useMemo(() => {
    if (!lawSearchTerm) return laws;
    return laws.filter(l => 
      l.paragraph.toLowerCase().includes(lawSearchTerm.toLowerCase()) ||
      l.title.toLowerCase().includes(lawSearchTerm.toLowerCase())
    );
  }, [laws, lawSearchTerm]);

  const toggleSort = (key: keyof User) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumn = (col: string) => {
    const next = new Set(visibleColumns);
    if (next.has(col)) next.delete(col);
    else next.add(col);
    setVisibleColumns(next);
  };

  const resetToRoleDefaults = () => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      permissions: [...roleDefaults[editingUser.role]]
    });
  };

  const handleCreateUser = () => {
    setEditingUser({
      id: `user-${Date.now()}`,
      firstName: '',
      lastName: '',
      rank: '',
      badgeNumber: '',
      role: Role.GE,
      isAdmin: false,
      permissions: [...roleDefaults[Role.GE]]
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const deleteUser = (id: string) => {
    if (id === 'admin-1') return alert("Haupt-Administrator kann nicht gelöscht werden.");
    if (confirm("Nutzerkonto unwiderruflich löschen?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const exists = users.find(u => u.id === editingUser.id);
    if (exists) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    } else {
      setUsers([...users, editingUser]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const togglePermissionForRole = (role: Role, perm: Permission) => {
    setRoleDefaults(prev => {
      const current = prev[role];
      const next = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
      return { ...prev, [role]: next };
    });
  };

  const togglePermissionForUser = (perm: Permission) => {
    if (!editingUser) return;
    const current = editingUser.permissions;
    const next = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
    setEditingUser({ ...editingUser, permissions: next });
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Page Header with Logo */}
      <div className="flex items-center gap-8 mb-10 border-b border-white/10 pb-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
          <img src={POLICE_LOGO_RAW} alt="BPOL Logo" className="h-28 w-auto relative z-10 drop-shadow-2xl transition-transform duration-500 hover:scale-105" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Zentral-Administration</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="h-1.5 w-16 bg-blue-600 rounded-full"></span>
            <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">Infrastruktur & Berechtigungsmanagement</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 p-1.5 bg-slate-900 border border-slate-700 rounded-xl w-fit shadow-lg">
        <button onClick={() => setTab('Users')} className={`px-8 py-3 rounded-lg font-bold transition-all text-xs uppercase tracking-widest ${tab === 'Users' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Dienstkonten</button>
        <button onClick={() => setTab('Roles')} className={`px-8 py-3 rounded-lg font-bold transition-all text-xs uppercase tracking-widest ${tab === 'Roles' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Rollen-Standards</button>
        <button onClick={() => setTab('Laws')} className={`px-8 py-3 rounded-lg font-bold transition-all text-xs uppercase tracking-widest ${tab === 'Laws' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Gesetze</button>
      </div>

      {tab === 'Users' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[300px] space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Suche (Name / Nummer)</label>
              <input 
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                placeholder="ADLER-Abfrage..." 
                className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white text-xs outline-none focus:border-blue-600"
              />
            </div>
            <div className="w-48 space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Filter: Rolle</label>
              <select 
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white text-xs outline-none appearance-none"
              >
                <option>Alle</option>
                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-8 flex justify-between items-center border-b border-slate-700 bg-slate-800/50">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-4 bg-blue-500 rounded-sm"></div>
                 <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Dienstkonten-Verzeichnis</h3>
               </div>
               <button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95">Nutzer Anlegen</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th onClick={() => toggleSort('lastName')} className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                      Name / Dienstgrad {sortConfig.key === 'lastName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => toggleSort('badgeNumber')} className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                      Dienstnummer {sortConfig.key === 'badgeNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => toggleSort('role')} className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                      Rolle {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800 transition-colors">
                      <td className="p-6">
                        <div className="font-black text-white uppercase text-xs">{u.rank} {u.lastName}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase">{u.firstName}</div>
                      </td>
                      <td className="p-6">
                        <span className="font-mono text-[11px] text-blue-400 bg-blue-950/40 px-3 py-1 rounded border border-blue-900/30">{u.badgeNumber}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-[9px] font-black text-slate-200 uppercase bg-slate-700 px-2.5 py-1 rounded">{u.role}</span>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => handleEditUser(u)} className="text-blue-500 uppercase text-[10px] font-black mr-6 hover:text-blue-400">Editieren</button>
                        <button onClick={() => deleteUser(u.id)} className="text-red-500 uppercase text-[10px] font-black hover:text-red-400">Entfernen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'Roles' && (
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-8 shadow-sm space-y-10">
           <div className="border-b border-slate-700 pb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Standard-Berechtigungsschema</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Hier festgelegte Werte dienen als Vorlage für neue Dienstkonten.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.values(Role) as Role[]).map(role => (
                <div key={role} className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="font-black text-white uppercase text-[11px]">{role}</h4>
                   </div>
                   <div className="space-y-2">
                      {(Object.values(Permission) as Permission[]).map(perm => (
                        <label key={perm} className="flex items-center justify-between cursor-pointer hover:bg-white/[0.02] p-1 rounded transition-all">
                           <span className={`text-[9px] font-bold uppercase transition-colors ${roleDefaults[role].includes(perm) ? 'text-slate-200' : 'text-slate-600'}`}>{perm.replace(/_/g, ' ')}</span>
                           <input type="checkbox" className="hidden" checked={roleDefaults[role].includes(perm)} onChange={() => togglePermissionForRole(role, perm)} />
                           <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${roleDefaults[role].includes(perm) ? 'bg-blue-600' : 'bg-slate-800'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full transition-all ${roleDefaults[role].includes(perm) ? 'ml-4' : 'ml-0'}`}></div>
                           </div>
                        </label>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {tab === 'Laws' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={(e) => {
              e.preventDefault();
              const updated = [...laws, { ...newLaw, id: Date.now().toString() }];
              setLaws(updated);
              localStorage.setItem('bpol_laws', JSON.stringify(updated));
              setNewLaw({ paragraph: '', title: '', description: '' });
            }} className="bg-[#1e293b] border border-slate-700 p-8 rounded-xl space-y-5 shadow-sm sticky top-10">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Straftatbestand erfassen</h3>
              <div className="space-y-4">
                <input required value={newLaw.paragraph} onChange={e => setNewLaw({...newLaw, paragraph: e.target.value})} placeholder="Paragraph..." className="w-full bg-black border border-slate-800 rounded-lg p-4 text-white text-xs outline-none focus:border-indigo-600 transition-all" />
                <input required value={newLaw.title} onChange={e => setNewLaw({...newLaw, title: e.target.value})} placeholder="Deliktbezeichnung..." className="w-full bg-black border border-slate-800 rounded-lg p-4 text-white text-xs outline-none focus:border-indigo-600 transition-all" />
                <textarea value={newLaw.description} onChange={e => setNewLaw({...newLaw, description: e.target.value})} placeholder="Details..." className="w-full bg-black border border-slate-800 rounded-lg p-4 text-white text-xs outline-none resize-none h-24 focus:border-indigo-600 transition-all" />
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95">Speichern</button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-inner">
               <div className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] mb-3 ml-1">Live-Filter: Gesetze</div>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">🔍</span>
                  <input 
                    value={lawSearchTerm}
                    onChange={e => setLawSearchTerm(e.target.value)}
                    placeholder="Suche nach Paragraph oder Titel (z.B. § 242)..." 
                    className="w-full bg-black border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-white text-xs outline-none focus:border-indigo-600 transition-all"
                  />
               </div>
            </div>
            <div className="space-y-3">
              {filteredLaws.map(l => (
                <div key={l.id} className="bg-[#1e293b]/50 border border-slate-700 p-6 rounded-2xl flex justify-between items-center group hover:bg-slate-800/80 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/20">§</div>
                    <div>
                      <span className="text-indigo-400 font-black text-sm block mb-1">{l.paragraph}</span>
                      <span className="text-slate-200 font-bold uppercase text-[11px] tracking-tight">{l.title}</span>
                    </div>
                  </div>
                  <button onClick={() => {
                    const updated = laws.filter(x => x.id !== l.id);
                    setLaws(updated);
                    localStorage.setItem('bpol_laws', JSON.stringify(updated));
                  }} className="h-8 w-8 bg-red-900/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white flex items-center justify-center font-bold">✕</button>
                </div>
              ))}
              {filteredLaws.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                  <div className="text-4xl mb-4 opacity-20">🔎</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Keine Gesetze unter diesem Filter gefunden</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Advanced User Editing Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="w-full max-w-5xl bg-[#1e293b] border border-slate-700 rounded-2xl p-10 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Konto-Audit & Modifikation</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-all">✕</button>
             </div>
             
             <form onSubmit={saveUser} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-3">Identitäts- & Dienstdaten</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <input required placeholder="Vorname" value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="bg-black border border-slate-800 p-4 rounded-lg text-white text-xs outline-none" />
                      <input required placeholder="Nachname" value={editingUser.lastName} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="bg-black border border-slate-800 p-4 rounded-lg text-white text-xs outline-none" />
                   </div>
                   <input required placeholder="Dienstgrad" value={editingUser.rank} onChange={e => setEditingUser({...editingUser, rank: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-lg text-white text-xs outline-none" />
                   <input required placeholder="Dienstnummer" value={editingUser.badgeNumber} onChange={e => setEditingUser({...editingUser, badgeNumber: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-lg text-white text-xs outline-none" />
                   
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dienst-Rolle</label>
                      <select 
                        className="w-full bg-black border border-slate-800 p-4 rounded-lg text-white text-xs outline-none appearance-none"
                        value={editingUser.role}
                        onChange={(e) => {
                          const role = e.target.value as Role;
                          setEditingUser({ ...editingUser, role, permissions: [...roleDefaults[role]] });
                        }}
                      >
                         {(Object.values(Role) as Role[]).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                   </div>

                   <label className="flex items-center gap-4 cursor-pointer group p-4 bg-slate-900 rounded-lg border border-slate-800 hover:border-amber-600/30 transition-all">
                      <input type="checkbox" className="hidden" checked={editingUser.isAdmin} onChange={e => setEditingUser({...editingUser, isAdmin: e.target.checked})} />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${editingUser.isAdmin ? 'bg-amber-600 border-amber-400' : 'bg-slate-800 border-slate-700'}`}>
                         {editingUser.isAdmin && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Privilegierter Administrator-Status</span>
                   </label>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] border-l-4 border-emerald-600 pl-3">Spezifische Berechtigungen</h4>
                      <button 
                        type="button" 
                        onClick={resetToRoleDefaults}
                        className="text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all bg-slate-800 px-3 py-1 rounded border border-slate-700"
                      >
                        Reset auf Rollen-Standard
                      </button>
                   </div>
                   
                   <div className="space-y-1 bg-black/40 p-4 rounded-xl border border-slate-800 max-h-[350px] overflow-y-auto custom-scrollbar">
                      {(Object.values(Permission) as Permission[]).map(perm => {
                        const isInherited = roleDefaults[editingUser.role].includes(perm);
                        return (
                          <label key={perm} className={`flex items-center justify-between p-2.5 rounded group cursor-pointer transition-all ${editingUser.permissions.includes(perm) ? 'bg-blue-600/10' : 'opacity-40 hover:opacity-100'}`}>
                             <div className="flex flex-col">
                               <span className={`text-[9px] font-bold uppercase tracking-widest ${editingUser.permissions.includes(perm) ? 'text-blue-400' : 'text-slate-500'}`}>
                                {perm.replace(/_/g, ' ')}
                               </span>
                               {isInherited && <span className="text-[7px] text-blue-800 font-black uppercase">Standard-Rolle</span>}
                             </div>
                             <input type="checkbox" className="hidden" checked={editingUser.permissions.includes(perm)} onChange={() => togglePermissionForUser(perm)} />
                             <div className={`w-7 h-3.5 rounded-full p-0.5 transition-all ${editingUser.permissions.includes(perm) ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-all ${editingUser.permissions.includes(perm) ? 'ml-3.5' : 'ml-0'}`}></div>
                             </div>
                          </label>
                        );
                      })}
                   </div>
                   <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-lg font-black uppercase text-[11px] tracking-widest shadow-lg transition-all active:scale-95">Änderungen persistent speichern</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
