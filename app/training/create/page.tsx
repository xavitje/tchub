'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Layout, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CreateTrainingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        level: 'BEGINNER',
        category: 'GENERAL',
        duration: '',
        imageUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData),
            });

            if (!res.ok) throw new Error('Failed to create course');

            const course = await res.json();
            router.push(`/training/${course.id}`);
        } catch (error) {
            console.error(error);
            alert('Er is iets misgegaan bij het aanmaken van de training.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/training" className="p-2 hover:bg-light-200 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-dark-100" />
                        </Link>
                        <h1 className="text-3xl font-bold text-dark">Nieuwe Training</h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Opslaan...' : 'Training Aanmaken'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Course Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-primary" />
                                Basis Informatie
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Titel</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="Bijv: Customer Service Excellence"
                                        value={courseData.title}
                                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Beschrijving</label>
                                    <textarea
                                        className="input w-full min-h-[120px]"
                                        placeholder="Vertel waar deze training over gaat..."
                                        value={courseData.description}
                                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 opacity-50 cursor-not-allowed">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    Modules & Lessen
                                </h2>
                                <span className="text-xs bg-light-300 text-dark-100 px-2 py-1 rounded">
                                    Later toevoegen
                                </span>
                            </div>
                            <p className="text-sm text-dark-100">
                                Na het aanmaken van de training kun je modules en lessen toevoegen op de detailpagina.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Settings */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Niveau</label>
                                    <select
                                        className="input w-full"
                                        value={courseData.level}
                                        onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Gemiddeld</option>
                                        <option value="ADVANCED">Gevorderd</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Categorie</label>
                                    <select
                                        className="input w-full"
                                        value={courseData.category}
                                        onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                                    >
                                        <option value="GENERAL">Algemeen</option>
                                        <option value="SALES">Sales</option>
                                        <option value="MARKETING">Marketing</option>
                                        <option value="PRODUCT">Product</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Geschatte duur</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="Bijv: 2 uur"
                                        value={courseData.duration}
                                        onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Afbeelding URL (optioneel)</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="https://..."
                                        value={courseData.imageUrl}
                                        onChange={(e) => setCourseData({ ...courseData, imageUrl: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
