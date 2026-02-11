'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Clock, Award, CheckCircle2, Play, Circle, Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    // Admin state
    const [isEditing, setIsEditing] = useState(false);
    const [showAddModule, setShowAddModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

    useEffect(() => {
        fetchCourse();
    }, [params.id]);

    async function fetchCourse() {
        try {
            const res = await fetch(`/api/training/${params.id}`);
            const data = await res.json();
            setCourse(data);
            // Expand first module by default
            if (data.modules?.length > 0) {
                setExpandedModules({ [data.modules[0].id]: true });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const handleAddModule = async () => {
        if (!newModuleTitle) return;
        try {
            const res = await fetch(`/api/training/${params.id}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newModuleTitle, order: course.modules.length }),
            });
            if (res.ok) {
                setNewModuleTitle('');
                setShowAddModule(false);
                fetchCourse();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="min-h-screen bg-light flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!course) return <div className="min-h-screen bg-light flex flex-col items-center justify-center gap-4 text-dark-100"><ArrowLeft className="w-12 h-12 opacity-20" /><p>Training niet gevonden.</p></div>;

    return (
        <div className="min-h-screen bg-light">
            {/* Header Content */}
            <div className="bg-white border-b border-light-400">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <Link href="/training" className="flex items-center gap-2 text-primary hover:underline mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Terug naar trainingen
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-50 text-primary">
                                    {course.category}
                                </span>
                                <span className="badge bg-light-200 text-dark-100">
                                    {course.level}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-dark mb-4">{course.title}</h1>
                            <p className="text-dark-100 max-w-3xl">{course.description}</p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <div className="card p-4 bg-light-50 border-primary/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-bold text-dark">{course.duration || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-success" />
                                    <span className="text-sm font-bold text-dark">Certificaat</span>
                                </div>
                            </div>
                            {canAccessAdmin && (
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="btn btn-outline flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    {isEditing ? 'Stoppen met bewerken' : 'Bewerk Modules'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Module List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-dark mb-4">Cursus Inhoud</h2>

                        {course.modules?.map((module: any, idx: number) => (
                            <div key={module.id} className="card overflow-hidden">
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-light-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-8 h-8 rounded-full bg-light-200 flex items-center justify-center font-bold text-dark text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-dark">{module.title}</h3>
                                            <p className="text-xs text-dark-100">{module.lessons?.length || 0} lessen</p>
                                        </div>
                                    </div>
                                    {expandedModules[module.id] ? <ChevronUp className="w-5 h-5 text-dark-100" /> : <ChevronDown className="w-5 h-5 text-dark-100" />}
                                </button>

                                {expandedModules[module.id] && (
                                    <div className="border-t border-light-300 divide-y divide-light-300">
                                        {module.lessons?.map((lesson: any) => (
                                            <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-light-50">
                                                <div className="flex items-center gap-4">
                                                    <Circle className="w-4 h-4 text-dark-100" />
                                                    <span className="text-sm text-dark font-medium">{lesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-dark-100">{lesson.duration} min</span>
                                                    <button className="p-1 hover:text-primary transition-colors">
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {isEditing && (
                                            <button className="w-full p-4 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-2 font-bold transition-all">
                                                <Plus className="w-4 h-4" /> Les Toevoegen
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isEditing && !showAddModule && (
                            <button
                                onClick={() => setShowAddModule(true)}
                                className="w-full p-6 border-2 border-dashed border-light-400 rounded-2xl text-dark-100 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 font-bold"
                            >
                                <Plus className="w-5 h-5" /> Module Toevoegen
                            </button>
                        )}

                        {showAddModule && (
                            <div className="card p-6 border-2 border-primary">
                                <h3 className="font-bold text-dark mb-4">Nieuwe Module</h3>
                                <input
                                    type="text"
                                    className="input w-full mb-4"
                                    placeholder="Module Titel"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleAddModule}
                                        className="btn btn-primary flex-1"
                                    >
                                        Toevoegen
                                    </button>
                                    <button
                                        onClick={() => setShowAddModule(false)}
                                        className="btn btn-outline flex-1"
                                    >
                                        Annuleren
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Progress */}
                    <div className="space-y-6">
                        <div className="card p-6 bg-gradient-to-br from-primary to-primary-600 text-white border-0 shadow-lg shadow-primary/20">
                            <h3 className="text-lg font-bold mb-4">Mijn Voortgang</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Voltooiing</span>
                                    <span className="font-bold">0%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-white h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <button className="w-full btn bg-white text-primary hover:bg-white/90 border-0 font-bold mt-4">
                                    Hervatten
                                </button>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-warning" />
                                Wat je gaat leren
                            </h3>
                            <ul className="space-y-3">
                                {course.description.split('.').filter(Boolean).slice(0, 4).map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-dark-100">
                                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                                        {point.trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
