'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Clock, Award, CheckCircle2, Play, Circle, Plus, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [progress, setProgress] = useState<any[]>([]);
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    // Admin state
    const [isEditing, setIsEditing] = useState(false);
    const [showAddModule, setShowAddModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

    useEffect(() => {
        fetchCourse();
        fetchProgress();
        fetchCertificate();
    }, [params.id]);

    async function fetchCourse() {
        try {
            const res = await fetch(`/api/training/${params.id}`);
            const data = await res.json();
            setCourse(data);
            if (data.modules?.length > 0) {
                setExpandedModules({ [data.modules[0].id]: true });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchProgress() {
        try {
            const res = await fetch(`/api/training/progress?courseId=${params.id}`);
            const data = await res.json();
            setProgress(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchCertificate() {
        try {
            const res = await fetch(`/api/training/${params.id}/certificate`);
            if (res.ok) {
                const data = await res.json();
                setCertificate(data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const totalLessons = course?.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
    const completedLessons = progress.filter(p => p.status === 'COMPLETED').length;
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const isFullyCompleted = completionPercentage === 100 && totalLessons > 0;

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
                                    <Award className={`w-5 h-5 ${isFullyCompleted ? 'text-success animate-bounce' : 'text-dark-100'}`} />
                                    <span className={`text-sm font-bold ${isFullyCompleted ? 'text-success' : 'text-dark'}`}>Certificaat</span>
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
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-dark">Cursus Inhoud</h2>
                            <span className="text-sm text-dark-100 font-medium">{completedLessons} van {totalLessons} voltooid</span>
                        </div>

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
                                    <div className="flex items-center gap-4">
                                        {expandedModules[module.id] ? <ChevronUp className="w-5 h-5 text-dark-100" /> : <ChevronDown className="w-5 h-5 text-dark-100" />}
                                    </div>
                                </button>

                                {expandedModules[module.id] && (
                                    <div className="border-t border-light-300 divide-y divide-light-300">
                                        {module.lessons?.map((lesson: any) => {
                                            const isLessonCompleted = progress.some(p => p.lessonId === lesson.id && p.status === 'COMPLETED');
                                            return (
                                                <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-light-50">
                                                    <div className="flex items-center gap-4">
                                                        {isLessonCompleted ? (
                                                            <CheckCircle2 className="w-4 h-4 text-success" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-dark-100 opacity-20" />
                                                        )}
                                                        <Link
                                                            href={`/training/lesson/${lesson.id}`}
                                                            className={`text-sm font-medium hover:text-primary transition-colors ${isLessonCompleted ? 'text-dark-100 line-through' : 'text-dark'}`}
                                                        >
                                                            {lesson.title}
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs text-dark-100">{lesson.duration || '5'} min</span>
                                                        <Link
                                                            href={`/training/lesson/${lesson.id}`}
                                                            className={`p-2 rounded-full transition-colors ${isLessonCompleted ? 'text-success hover:bg-success/10' : 'text-primary hover:bg-primary/10'}`}
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {isEditing && (
                                            <button className="w-full p-4 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-2 font-bold transition-all">
                                                <Plus className="w-4 h-4" /> Les Toevoegen
                                            </button>
                                        )}

                                        {/* Module Quiz Section */}
                                        <div className="p-4 bg-light-50 border-t border-light-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${module.quiz ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-dark">Module Quiz</span>
                                                        {!module.quiz && <p className="text-xs text-dark-100">Geen quiz beschikbaar</p>}
                                                    </div>
                                                </div>

                                                {isEditing ? (
                                                    <Link
                                                        href={`/training/quiz-builder?moduleId=${module.id}`}
                                                        className="btn btn-sm btn-ghost text-primary"
                                                    >
                                                        {module.quiz ? 'Quiz Bewerken' : 'Quiz Toevoegen'}
                                                    </Link>
                                                ) : module.quiz && (
                                                    <Link
                                                        href={`/training/quiz/${module.quiz.id}`}
                                                        className="btn btn-sm btn-outline border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                                                    >
                                                        Start Quiz
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Final Exam Section */}
                        {(course.finalExam || isEditing) && (
                            <div className="card overflow-hidden border-2 border-primary/20">
                                <div className="p-4 bg-primary/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-dark">Eindexamen</h3>
                                            <p className="text-xs text-dark-100">
                                                {course.finalExam ? 'Toets je kennis' : 'Nog geen examen'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Admin Actions */}
                                    {isEditing && (
                                        <Link
                                            href={`/training/quiz-builder?courseId=${course.id}`}
                                            className="btn btn-sm btn-outline flex items-center gap-2"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            {course.finalExam ? 'Bewerken' : 'Aanmaken'}
                                        </Link>
                                    )}

                                    {/* User Actions */}
                                    {!isEditing && course.finalExam && (
                                        certificate ? (
                                            <div className="flex items-center gap-2 text-success font-bold bg-white px-4 py-2 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Behaald
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/training/quiz/${course.finalExam.id}`}
                                                className="btn btn-primary"
                                            >
                                                Start Examen
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {isEditing && !showAddModule && (
                            <button
                                onClick={() => setShowAddModule(true)}
                                className="w-full p-6 border-2 border-dashed border-light-400 rounded-2xl text-dark-100 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 font-bold"
                            >
                                <Plus className="w-5 h-5" /> Module Toevoegen
                            </button>
                        )}
                    </div>

                    {/* Sidebar / Progress */}
                    <div className="space-y-6">
                        <div className={`card p-6 shadow-lg transition-all ${isFullyCompleted ? 'bg-gradient-to-br from-success to-success-600 text-white border-0 shadow-success/20' : 'bg-gradient-to-br from-primary to-primary-600 text-white border-0 shadow-primary/20'}`}>
                            <h3 className="text-lg font-bold mb-4">{isFullyCompleted ? 'Gefeliciteerd!' : 'Mijn Voortgang'}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span>{isFullyCompleted ? 'Cursus Voltooid' : 'Voltooiing'}</span>
                                    <span className="font-bold">{completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                                </div>
                                {certificate ? (
                                    <Link
                                        href={`/certificates/${certificate.code}`}
                                        className="w-full btn bg-white text-success hover:bg-white/90 border-0 font-bold mt-4 flex items-center justify-center gap-2"
                                    >
                                        <Award className="w-5 h-5" /> Bekijk Certificaat
                                    </Link>
                                ) : isFullyCompleted ? (
                                    <div className="mt-4 text-center">
                                        <div className="text-white/80 text-sm mb-2">Alle lessen voltooid!</div>
                                        {course.finalExam ? (
                                            <Link
                                                href={`/training/quiz/${course.finalExam.id}`}
                                                className="w-full btn bg-white text-primary hover:bg-white/90 border-0 font-bold"
                                            >
                                                Start Eindexamen
                                            </Link>
                                        ) : (
                                            <div className="font-bold">Training Afgerond</div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            const nextLesson = course.modules?.[0]?.lessons?.[0];
                                            if (nextLesson) router.push(`/training/lesson/${nextLesson.id}`);
                                        }}
                                        className="w-full btn bg-white text-primary hover:bg-white/90 border-0 font-bold mt-4"
                                    >
                                        Hervatten
                                    </button>
                                )}
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
