'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    Shield,
    Users,
    Trash2,
    Edit2,
    Check,
    X,
    AlertTriangle,
    Megaphone,
    Lock,
    Plus,
    ChevronRight,
    Search,
    Briefcase,
    Image as ImageIcon
} from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationSystem';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import { validateFile } from '@/lib/upload';

type Tab = 'users' | 'roles' | 'announcements' | 'hubs';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const { hasPermission, hasAnyPermission } = usePermission();

    // UI State
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [loading, setLoading] = useState(true);

    // User Management State
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState<string>('');

    // Role & Permission State
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [roleForm, setRoleForm] = useState({ name: '', description: '', permissionIds: [] as string[] });

    // Announcement State
    const [newAnnouncement, setNewAnnouncement] = useState<{
        title: string;
        content: string;
        announcementType: 'REGULAR' | 'SHAREPOINT_LINK';
        sharePointUrl: string;
    }>({
        title: '',
        content: '',
        announcementType: 'REGULAR',
        sharePointUrl: ''
    });
    const [submittingNews, setSubmittingNews] = useState(false);
    const [announcementImage, setAnnouncementImage] = useState<{ url: string, filename: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hub State
    const [hubs, setHubs] = useState<any[]>([]);
    const [isHubModalOpen, setIsHubModalOpen] = useState(false);
    const [editingHub, setEditingHub] = useState<any>(null);
    const [hubForm, setHubForm] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        sharePointUrl: '',
        order: 0,
        isActive: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes, permsRes, announcementsRes, hubsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/roles'),
                fetch('/api/admin/permissions'),
                fetch('/api/admin/announcements'),
                fetch('/api/admin/hubs')
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (rolesRes.ok) setRoles(await rolesRes.json());
            if (permsRes.ok) setPermissions(await permsRes.json());
            if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
            if (hubsRes.ok) setHubs(await hubsRes.json());
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            showNotification('error', 'Fout bij ophalen gegevens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [session]);

    // User Handlers
    const handleUserRoleUpdate = async (userId: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customRoleId: selectedRoleId })
            });

            if (res.ok) {
                showNotification('success', 'Gebruikersrol bijgewerkt');
                fetchData();
                setEditingUser(null);
            } else {
                showNotification('error', 'Fout bij bijwerken rol');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    const handleUserTitleUpdate = async (userId: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle: newTitle })
            });

            if (res.ok) {
                showNotification('success', 'Gebruikerstitel bijgewerkt');
                fetchData();
                setEditingTitle(null);
            } else {
                showNotification('error', 'Fout bij bijwerken titel');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('success', 'Gebruiker verwijderd');
                fetchData();
            } else {
                showNotification('error', 'Fout bij verwijderen');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    // Role Handlers
    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingRole ? 'PATCH' : 'POST';
        const url = editingRole ? `/api/admin/roles/${editingRole.id}` : '/api/admin/roles';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleForm)
            });

            if (res.ok) {
                showNotification('success', `Rol succesvol ${editingRole ? 'bijgewerkt' : 'aangemaakt'}`);
                setIsRoleModalOpen(false);
                setEditingRole(null);
                setRoleForm({ name: '', description: '', permissionIds: [] });
                fetchData();
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Fout bij opslaan rol');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!confirm('Weet je zeker dat je deze rol wilt verwijderen?')) return;
        try {
            const res = await fetch(`/api/admin/roles/${roleId}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('success', 'Rol verwijderd');
                fetchData();
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Fout bij verwijderen');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            showNotification('error', error);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setAnnouncementImage(data);
            } else {
                showNotification('error', 'Uploaden mislukt');
            }
        } catch (error) {
            showNotification('error', 'Fout bij uploaden');
        } finally {
            setIsUploading(false);
        }
    };

    // Announcement Handlers
    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.title) return;
        if (newAnnouncement.announcementType === 'REGULAR' && !newAnnouncement.content) return;
        if (newAnnouncement.announcementType === 'SHAREPOINT_LINK' && !newAnnouncement.sharePointUrl) return;

        setSubmittingNews(true);
        try {
            const url = editingAnnouncement ? `/api/admin/announcements/${editingAnnouncement.id}` : '/api/admin/announcements';
            const method = editingAnnouncement ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newAnnouncement.title,
                    content: newAnnouncement.announcementType === 'REGULAR' ? newAnnouncement.content : '',
                    imageUrl: announcementImage?.url || editingAnnouncement?.imageUrl,
                    announcementType: newAnnouncement.announcementType,
                    sharePointUrl: newAnnouncement.announcementType === 'SHAREPOINT_LINK' ? newAnnouncement.sharePointUrl : null
                })
            });

            if (res.ok) {
                showNotification('success', editingAnnouncement ? 'Aankondiging bijgewerkt' : 'Aankondiging geplaatst');
                setNewAnnouncement({ title: '', content: '', announcementType: 'REGULAR', sharePointUrl: '' });
                setAnnouncementImage(null);
                setEditingAnnouncement(null);
                fetchData();
            } else {
                showNotification('error', 'Fout bij plaatsen');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        } finally {
            setSubmittingNews(false);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Weet je zeker dat je deze aankondiging wilt verwijderen?')) return;

        try {
            const res = await fetch(`/api/admin/announcements/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showNotification('success', 'Aankondiging verwijderd');
                fetchData();
            } else {
                showNotification('error', 'Fout bij verwijderen');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    const handleEditAnnouncement = (announcement: any) => {
        setEditingAnnouncement(announcement);
        setNewAnnouncement({
            title: announcement.title,
            content: announcement.content || '',
            announcementType: announcement.announcementType || 'REGULAR',
            sharePointUrl: announcement.sharePointUrl || ''
        });
        setAnnouncementImage(announcement.imageUrl ? { url: announcement.imageUrl, filename: '' } : null);
        setActiveTab('announcements');
    };

    if (!hasPermission('ACCESS_ADMIN')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light">
                <div className="text-center p-8 card max-w-md">
                    <Shield className="w-16 h-16 text-error mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-dark mb-2">Toegang Geweigerd</h1>
                    <p className="text-dark-100">U heeft geen beheerdersrechten om deze pagina te bekijken.</p>
                </div>
            </div>
        );
    }

    // Hub Handlers
    const handleSaveHub = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingHub ? 'PATCH' : 'POST';
        const url = editingHub ? `/api/admin/hubs/${editingHub.id}` : '/api/admin/hubs';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hubForm)
            });

            if (res.ok) {
                showNotification('success', `Hub succesvol ${editingHub ? 'bijgewerkt' : 'aangemaakt'}`);
                setIsHubModalOpen(false);
                setEditingHub(null);
                setHubForm({ name: '', slug: '', description: '', icon: '', sharePointUrl: '', order: 0, isActive: true });
                fetchData();
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Fout bij opslaan hub');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    const handleDeleteHub = async (hubId: string) => {
        if (!confirm('Weet je zeker dat je deze hub wilt verwijderen?')) return;
        try {
            const res = await fetch(`/api/admin/hubs/${hubId}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('success', 'Hub verwijderd');
                fetchData();
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Fout bij verwijderen');
            }
        } catch (error) {
            showNotification('error', 'Netwerkfout');
        }
    };

    return (
        <div className="min-h-screen bg-light py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
                        <p className="text-dark-100">Beheer platform structuur, rollen en gebruikers</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-light-400 mb-8 w-fit overflow-x-auto">
                    {hasPermission('MANAGE_USERS') && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === 'users' ? "bg-primary text-white shadow-md" : "text-dark-100 hover:bg-light-100"
                            )}
                        >
                            Gebruikers
                        </button>
                    )}
                    {hasPermission('MANAGE_ROLES') && (
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === 'roles' ? "bg-primary text-white shadow-md" : "text-dark-100 hover:bg-light-100"
                            )}
                        >
                            Rollen & Rechten
                        </button>
                    )}
                    {(hasPermission('MANAGE_HUBS') || hasPermission('ACCESS_ADMIN')) && (
                        <button
                            onClick={() => setActiveTab('hubs')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === 'hubs' ? "bg-primary text-white shadow-md" : "text-dark-100 hover:bg-light-100"
                            )}
                        >
                            TC Hubs
                        </button>
                    )}
                    {hasPermission('CREATE_ANNOUNCEMENT') && (
                        <button
                            onClick={() => setActiveTab('announcements')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === 'announcements' ? "bg-primary text-white shadow-md" : "text-dark-100 hover:bg-light-100"
                            )}
                        >
                            Aankondigingen
                        </button>
                    )}
                </div>

                {/* Content Sections */}
                {activeTab === 'users' && hasPermission('MANAGE_USERS') && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <div className="p-6 border-b border-light-400 bg-white flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-dark">Gebruikersbeheer</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-light-100 border-b border-light-400">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">Gebruiker</th>
                                            <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">Titel</th>
                                            <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">Rol</th>
                                            <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider text-right">Acties</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-light-400 bg-white">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-light-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-dark">{user.displayName}</div>
                                                    <div className="text-[10px] text-dark-100">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingTitle === user.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={newTitle}
                                                                onChange={(e) => setNewTitle(e.target.value)}
                                                                className="input text-xs h-8 py-0 w-40"
                                                                placeholder="Functie titel..."
                                                            />
                                                            <button onClick={() => handleUserTitleUpdate(user.id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setEditingTitle(null)} className="p-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 group">
                                                            <span className="text-sm text-dark-100">
                                                                {user.jobTitle || 'Nog geen titel'}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingTitle(user.id);
                                                                    setNewTitle(user.jobTitle || '');
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-dark-100 hover:text-primary transition-all"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingUser === user.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={selectedRoleId}
                                                                onChange={(e) => setSelectedRoleId(e.target.value)}
                                                                className="select text-xs h-8 py-0 min-w-[120px]"
                                                            >
                                                                <option value="">Geen rol</option>
                                                                {roles.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                            <button onClick={() => handleUserRoleUpdate(user.id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setEditingUser(null)} className="p-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 group">
                                                            <span className="px-2 py-1 bg-light-200 rounded text-[10px] font-bold text-dark-100">
                                                                {user.customRole?.name || user.role || 'N/A'}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(user.id);
                                                                    setSelectedRoleId(user.roleId || '');
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-dark-100 hover:text-primary transition-all"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={user.email === session?.user?.email}
                                                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors disabled:opacity-20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'roles' && hasPermission('MANAGE_ROLES') && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-dark">Rollen & Permissies</h2>
                            <button
                                onClick={() => {
                                    setEditingRole(null);
                                    setRoleForm({ name: '', description: '', permissionIds: [] });
                                    setIsRoleModalOpen(true);
                                }}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Nieuwe Rol
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roles.map(role => (
                                <div key={role.id} className="card p-6 flex flex-col hover:shadow-medium transition-all group">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-dark group-hover:text-primary transition-colors">{role.name}</h3>
                                            <p className="text-xs text-dark-100 line-clamp-1">{role.description || 'Geen beschrijving'}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingRole(role);
                                                setRoleForm({
                                                    name: role.name,
                                                    description: role.description || '',
                                                    permissionIds: role.permissionIds || []
                                                });
                                                setIsRoleModalOpen(true);
                                            }}
                                            className="p-2 bg-light-200 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex-1 mt-4">
                                        <p className="text-[10px] font-bold text-dark-100 uppercase tracking-widest mb-2">Permissies ({role.permissions?.length || 0})</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {role.permissions?.slice(0, 5).map((p: any) => (
                                                <span key={p.id} className="px-2 py-0.5 bg-light-100 border border-light-400 rounded-md text-[9px] text-dark-100 font-medium">
                                                    {p.name.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                            {(role.permissions?.length > 5) && (
                                                <span className="text-[9px] text-dark-100/50 flex items-center gap-1 ml-1">
                                                    +{role.permissions.length - 5} meer
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-light-400 flex items-center justify-between">
                                        <span className="text-xs text-dark-100 font-medium flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 opacity-40" />
                                            {role._count?.users || 0} gebruikers
                                        </span>
                                        <button
                                            onClick={() => handleDeleteRole(role.id)}
                                            className="p-1 px-2 text-[10px] font-bold text-error/30 hover:text-error hover:bg-error/5 rounded transition-all"
                                        >
                                            Verwijderen
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && hasPermission('CREATE_ANNOUNCEMENT') && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Create/Edit Form */}
                        <div className="max-w-3xl">
                            <div className="card p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-warning-100 rounded-2xl shadow-sm">
                                        <Megaphone className="w-6 h-6 text-warning" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-dark">{editingAnnouncement ? 'Aankondiging Bewerken' : 'Nieuwe Aankondiging'}</h2>
                                        <p className="text-xs text-dark-100">Dit bericht wordt bovenaan de feed van alle gebruikers geplaatst.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                                    {/* Announcement Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-3">Type Aankondiging</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewAnnouncement({ ...newAnnouncement, announcementType: 'REGULAR' })}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${newAnnouncement.announcementType === 'REGULAR' ? 'border-primary bg-primary-50' : 'border-light-400'}`}
                                            >
                                                <p className="font-bold text-dark text-sm">Gewoon Bericht</p>
                                                <p className="text-xs text-dark-100 mt-1">Post met titel, inhoud en optioneel afbeelding</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewAnnouncement({ ...newAnnouncement, announcementType: 'SHAREPOINT_LINK' })}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${newAnnouncement.announcementType === 'SHAREPOINT_LINK' ? 'border-primary bg-primary-50' : 'border-light-400'}`}
                                            >
                                                <p className="font-bold text-dark text-sm">SharePoint Link</p>
                                                <p className="text-xs text-dark-100 mt-1">Afbeelding met titel linked naar SharePoint</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-2">Titel van de aankondiging</label>
                                        <input
                                            type="text"
                                            value={newAnnouncement.title}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                            className="input w-full bg-light-50 border-light-400 focus:bg-white transition-all text-lg h-12"
                                            placeholder="Bijv: Nieuwe SharePoint Update online!"
                                            required
                                        />
                                    </div>

                                    {/* Content - Only for REGULAR */}
                                    {newAnnouncement.announcementType === 'REGULAR' && (
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Inhoud (Bericht)</label>
                                            <textarea
                                                value={newAnnouncement.content}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                                className="input w-full min-h-[160px] py-4 bg-light-50 border-light-400 focus:bg-white transition-all leading-relaxed"
                                                placeholder="Schrijf hier de details van de aankondiging..."
                                                required
                                            />
                                        </div>
                                    )}

                                    {/* SharePoint URL - Only for SHAREPOINT_LINK */}
                                    {newAnnouncement.announcementType === 'SHAREPOINT_LINK' && (
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">SharePoint URL</label>
                                            <input
                                                type="url"
                                                value={newAnnouncement.sharePointUrl}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sharePointUrl: e.target.value })}
                                                className="input w-full bg-light-50 border-light-400 focus:bg-white transition-all"
                                                placeholder="https://company.sharepoint.com/..."
                                                required={newAnnouncement.announcementType === 'SHAREPOINT_LINK'}
                                            />
                                        </div>
                                    )}

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-2">Afbeelding {newAnnouncement.announcementType === 'SHAREPOINT_LINK' ? '(Aanbevolen)' : '(Optioneel)'}</label>
                                        <div className="flex items-center gap-4">
                                            {announcementImage ? (
                                                <div className="relative group">
                                                    <img src={announcementImage.url} alt="Preview" className="h-24 w-40 object-cover rounded-lg border border-light-400" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setAnnouncementImage(null)}
                                                        className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="h-24 w-40 flex flex-col items-center justify-center border-2 border-dashed border-light-400 rounded-lg text-dark-100 hover:border-primary hover:text-primary transition-colors bg-light-50"
                                                >
                                                    <ImageIcon className="w-6 h-6 mb-1" />
                                                    <span className="text-[10px] font-medium">{isUploading ? '...' : 'Uploaden'}</span>
                                                </button>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                            />
                                            <div className="text-xs text-dark-100">
                                                <p>Voeg een afbeelding toe om de aankondiging op te laten vallen.</p>
                                                <p>Aanbevolen formaat: 1200x600px</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <button
                                            type="submit"
                                            disabled={submittingNews || !newAnnouncement.title || (newAnnouncement.announcementType === 'REGULAR' && !newAnnouncement.content) || (newAnnouncement.announcementType === 'SHAREPOINT_LINK' && !newAnnouncement.sharePointUrl)}
                                            className="btn btn-warning flex-1 h-12 font-bold shadow-md shadow-warning/20 disabled:shadow-none"
                                        >
                                            {submittingNews ? 'Bezig...' : editingAnnouncement ? 'Bijwerken' : 'Publiceren'}
                                        </button>
                                        {editingAnnouncement && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingAnnouncement(null);
                                                    setNewAnnouncement({ title: '', content: '', announcementType: 'REGULAR', sharePointUrl: '' });
                                                    setAnnouncementImage(null);
                                                }}
                                                className="btn btn-outline h-12 px-6"
                                            >
                                                Annuleren
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Announcements List */}
                        {announcements.length > 0 && (
                            <div className="card">
                                <div className="p-6 border-b border-light-400 bg-light-50">
                                    <h2 className="text-xl font-bold text-dark">Bestaande Aankondigingen</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-light-100 border-b border-light-400">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">Titel</th>
                                                <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">Datum</th>
                                                <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider text-right">Acties</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-light-400 bg-white">
                                            {announcements.map((announcement) => (
                                                <tr key={announcement.id} className="hover:bg-light-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-dark line-clamp-2 max-w-xs">{announcement.title}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${announcement.announcementType === 'SHAREPOINT_LINK' ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'}`}>
                                                            {announcement.announcementType === 'SHAREPOINT_LINK' ? 'SharePoint Link' : 'Gewoon Bericht'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-100">
                                                        {new Date(announcement.createdAt).toLocaleDateString('nl-NL')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditAnnouncement(announcement)}
                                                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                            className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'hubs' && (hasPermission('MANAGE_HUBS') || hasPermission('ACCESS_ADMIN')) && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-dark">TC Hubs Beheer</h2>
                            <button
                                onClick={() => {
                                    setEditingHub(null);
                                    setHubForm({ name: '', slug: '', description: '', icon: '', sharePointUrl: '', order: hubs.length, isActive: true });
                                    setIsHubModalOpen(true);
                                }}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Nieuwe Hub
                            </button>
                        </div>

                        <div className="card overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-light-100 border-b border-light-400">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider w-16 text-center">Icon</th>
                                        <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">Naam / Slug</th>
                                        <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider">URL</th>
                                        <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider text-center">Volgorde</th>
                                        <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-dark-100 uppercase tracking-wider text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light-400 bg-white">
                                    {hubs.map(hub => (
                                        <tr key={hub.id} className="hover:bg-light-50 transition-colors">
                                            <td className="px-6 py-4 text-2xl text-center">{hub.icon}</td>
                                            <td className="px-6 py-4 pr-0">
                                                <div className="font-bold text-dark">{hub.name}</div>
                                                <div className="text-[10px] text-dark-100 font-mono">{hub.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-xs text-dark-100 truncate hover:text-clip hover:whitespace-normal transition-all" title={hub.sharePointUrl}>
                                                    {hub.sharePointUrl}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 bg-light-200 rounded text-xs font-bold">{hub.order}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "px-2 py-1 rounded text-[10px] font-bold",
                                                    hub.isActive ? "bg-success/20 text-success" : "bg-error/20 text-error"
                                                )}>
                                                    {hub.isActive ? 'ACTIEF' : 'INACTIEF'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingHub(hub);
                                                        setHubForm({
                                                            name: hub.name,
                                                            slug: hub.slug,
                                                            description: hub.description || '',
                                                            icon: hub.icon || '',
                                                            sharePointUrl: hub.sharePointUrl || '',
                                                            order: hub.order,
                                                            isActive: hub.isActive
                                                        });
                                                        setIsHubModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHub(hub.id)}
                                                    className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {hubs.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-dark-100">
                                                Geen hubs geconfigureerd. Voeg er een toe om te beginnen.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Role Modal */}
            {isRoleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setIsRoleModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-light-400 flex items-center justify-between bg-light-50">
                            <div>
                                <h3 className="text-xl font-bold text-dark">{editingRole ? 'Rol Bewerken' : 'Nieuwe Rol Aanmaken'}</h3>
                                <p className="text-xs text-dark-100">Kies een naam en selecteer de bijbehorende rechten</p>
                            </div>
                            <button onClick={() => setIsRoleModalOpen(false)} className="p-2 hover:bg-light-200 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">Rol Naam</label>
                                    <input
                                        type="text"
                                        required
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                        className="input w-full h-11"
                                        placeholder="Bijv: Content Editor"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">Beschrijving</label>
                                    <input
                                        type="text"
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                        className="input w-full h-11"
                                        placeholder="Wat kan deze persoon?"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-100 uppercase mb-3">Systeem Rechten (Permissies)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {permissions.map(perm => {
                                        const isSelected = roleForm.permissionIds.includes(perm.id);
                                        return (
                                            <button
                                                key={perm.id}
                                                type="button"
                                                onClick={() => {
                                                    const ids = isSelected
                                                        ? roleForm.permissionIds.filter(id => id !== perm.id)
                                                        : [...roleForm.permissionIds, perm.id];
                                                    setRoleForm({ ...roleForm, permissionIds: ids });
                                                }}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                                                    isSelected
                                                        ? "border-primary bg-primary/5 shadow-sm"
                                                        : "border-light-400 hover:border-dark-100/20"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded flex items-center justify-center transition-colors mt-0.5",
                                                    isSelected ? "bg-primary text-white" : "bg-light-200"
                                                )}>
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-xs font-bold", isSelected ? "text-primary" : "text-dark")}>
                                                        {perm.name.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-[10px] text-dark-100 leading-tight mt-0.5">{perm.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-light-400 bg-light-50 flex items-center justify-end gap-3">
                            <button onClick={() => setIsRoleModalOpen(false)} className="btn btn-outline h-11 px-6">Annuleren</button>
                            <button onClick={handleSaveRole} className="btn btn-primary h-11 px-10 shadow-lg shadow-primary/20">
                                {editingRole ? 'Wijzigingen Opslaan' : 'Rol Aanmaken'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Hub Modal */}
            {isHubModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setIsHubModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-light-400 flex items-center justify-between bg-light-50">
                            <div>
                                <h3 className="text-xl font-bold text-dark">{editingHub ? 'Hub Bewerken' : 'Nieuwe Hub Toevoegen'}</h3>
                                <p className="text-xs text-dark-100">Beheer de links in het TC Hubs menu</p>
                            </div>
                            <button onClick={() => setIsHubModalOpen(false)} className="p-2 hover:bg-light-200 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveHub} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">Naam</label>
                                    <input
                                        type="text"
                                        required
                                        value={hubForm.name}
                                        onChange={(e) => setHubForm({ ...hubForm, name: e.target.value })}
                                        className="input w-full h-11"
                                        placeholder="Bijv: Marketing Hub"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">Slug (uniek)</label>
                                    <input
                                        type="text"
                                        required
                                        value={hubForm.slug}
                                        onChange={(e) => setHubForm({ ...hubForm, slug: e.target.value })}
                                        className="input w-full h-11"
                                        placeholder="bijv: marketing-hub"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">Beschrijving</label>
                                <input
                                    type="text"
                                    value={hubForm.description}
                                    onChange={(e) => setHubForm({ ...hubForm, description: e.target.value })}
                                    className="input w-full h-11"
                                    placeholder="Korte omschrijving..."
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        value={hubForm.icon}
                                        onChange={(e) => setHubForm({ ...hubForm, icon: e.target.value })}
                                        className="input w-full h-11 text-center text-xl"
                                        placeholder="📢"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">SharePoint URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={hubForm.sharePointUrl}
                                        onChange={(e) => setHubForm({ ...hubForm, sharePointUrl: e.target.value })}
                                        className="input w-full h-11"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-dark-100 uppercase mb-1.5">Volgorde</label>
                                    <input
                                        type="number"
                                        value={hubForm.order}
                                        onChange={(e) => setHubForm({ ...hubForm, order: parseInt(e.target.value) })}
                                        className="input w-full h-11"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="hub-active"
                                        checked={hubForm.isActive}
                                        onChange={(e) => setHubForm({ ...hubForm, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-light-400 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="hub-active" className="text-sm font-bold text-dark">Actief</label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="btn btn-primary flex-1 h-12 font-bold shadow-md shadow-primary/20">
                                    {editingHub ? 'Bijwerken' : 'Toevoegen'}
                                </button>
                                <button type="button" onClick={() => setIsHubModalOpen(false)} className="btn btn-outline px-6 h-12">
                                    Annuleren
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
