'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Award, Plus, Clock, Play } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function TrainingPage() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch('/api/training');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();

                // Ensure data is an array
                if (Array.isArray(data)) {
                    setCourses(data);
                } else {
                    console.error('API did not return an array:', data);
                    setCourses([]);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const courseList = Array.isArray(courses) ? courses : [];

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-dark">Training & Ontwikkeling</h1>
                    {canAccessAdmin && (
                        <Link href="/training/create" className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Nieuwe Training
                        </Link>
                    )}
                </div>

                {/* Training Categories */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <BookOpen className="w-8 h-8 text-primary mb-2" />
                        <h3 className="font-semibold text-dark">Alle Trainingen</h3>
                        <p className="text-sm text-dark-100 mt-1">{courseList.length} beschikbaar</p>
                    </button>
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <Video className="w-8 h-8 text-info mb-2" />
                        <h3 className="font-semibold text-dark">Video Cursussen</h3>
                        <p className="text-sm text-dark-100 mt-1">0 cursussen</p>
                    </button>
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <FileText className="w-8 h-8 text-success mb-2" />
                        <h3 className="font-semibold text-dark">Documenten</h3>
                        <p className="text-sm text-dark-100 mt-1">0 resources</p>
                    </button>
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <Award className="w-8 h-8 text-warning mb-2" />
                        <h3 className="font-semibold text-dark">Certificeringen</h3>
                        <p className="text-sm text-dark-100 mt-1">0 programma's</p>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Courses List */}
                        <div>
                            <h2 className="text-xl font-semibold text-dark mb-4">Beschikbare Trainingen</h2>
                            {courseList.length === 0 ? (
                                <div className="card p-12 text-center text-dark-100">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Er zijn nog geen trainingen beschikbaar.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {courseList.map((course) => (
                                        <div key={course.id} className="card p-6 hover:shadow-medium transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-50 text-primary">
                                                            {course.category}
                                                        </span>
                                                        <span className="badge bg-light-200 text-dark-100">
                                                            {course.level}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-dark mb-2">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-dark-100 text-sm mb-4 line-clamp-2">
                                                        {course.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-dark-100">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {course.duration || 'N/A'}
                                                        </span>
                                                        <span>{course._count?.modules || 0} modules</span>
                                                    </div>
                                                </div>
                                                <Link href={`/training/${course.id}`} className="btn btn-primary ml-4 flex items-center gap-2">
                                                    <Play className="w-4 h-4" />
                                                    Start
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* My Progress */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Mijn Voortgang</h3>
                            <div className="space-y-4 text-center py-4">
                                <Award className="w-12 h-12 text-primary mx-auto opacity-20 mb-2" />
                                <p className="text-sm text-dark-100">Start je eerste training om je voortgang hier te zien!</p>
                            </div>
                        </div>

                        {/* Recent Trainings */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Laatste Updates</h3>
                            <div className="space-y-3">
                                {courseList.slice(0, 3).map((course) => (
                                    <Link
                                        key={course.id}
                                        href={`/training/${course.id}`}
                                        className="block p-3 bg-light-200 rounded-lg hover:bg-light-300 transition-colors"
                                    >
                                        <p className="font-medium text-dark text-sm line-clamp-1">{course.title}</p>
                                        <p className="text-[10px] text-dark-100 mt-1">
                                            {new Date(course.createdAt).toLocaleDateString('nl-NL')}
                                        </p>
                                    </Link>
                                ))}
                                {courseList.length === 0 && (
                                    <p className="text-sm text-dark-100 italic">Geen recente updates.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
