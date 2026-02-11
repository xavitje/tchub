'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Circle, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import Link from 'next/link';

export default function LessonPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [progress, setProgress] = useState<any>(null);

    useEffect(() => {
        fetchLesson();
    }, [params.id]);

    async function fetchLesson() {
        try {
            const res = await fetch(`/api/training/lessons/${params.id}`);
            const data = await res.json();
            setLesson(data);

            // Fetch user progress for this lesson
            const progRes = await fetch(`/api/training/progress?lessonId=${params.id}`);
            const progData = await progRes.json();
            const currentProg = progData.find((p: any) => p.lessonId === params.id);
            setProgress(currentProg);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleComplete = async () => {
        if (!lesson || isCompleting) return;
        setIsCompleting(true);
        try {
            const res = await fetch('/api/training/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: lesson.module.courseId,
                    lessonId: lesson.id,
                    status: 'COMPLETED'
                }),
            });
            if (res.ok) {
                fetchLesson();
                // If it's the last lesson, we might show a congrats
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCompleting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-light flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!lesson) return <div className="min-h-screen bg-light p-8 text-center"><p>Les niet gevonden.</p></div>;

    const isCompleted = progress?.status === 'COMPLETED';

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <Link href={`/training/${lesson.module.courseId}`} className="flex items-center gap-2 text-dark-100 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Terug naar cursus
                    </Link>
                    <div className="flex items-center gap-2">
                        {isCompleted && (
                            <span className="flex items-center gap-1 text-success font-bold text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                Voltooid
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Content Column */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="card p-8 min-h-[500px]">
                            <h1 className="text-3xl font-bold text-dark mb-6">{lesson.title}</h1>

                            {lesson.videoUrl && (
                                <div className="aspect-video bg-dark rounded-xl mb-8 flex items-center justify-center text-white">
                                    <p className="text-dark-100">Video Player Placeholder: {lesson.videoUrl}</p>
                                </div>
                            )}

                            <div className="prose max-w-none text-dark-100 whitespace-pre-line leading-relaxed">
                                {lesson.content}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button className="btn btn-outline flex items-center gap-2 opacity-50 cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" /> Vorige
                            </button>

                            {!isCompleted ? (
                                <button
                                    onClick={handleComplete}
                                    disabled={isCompleting}
                                    className="btn btn-primary px-8 py-3 rounded-full shadow-lg shadow-primary/20 flex items-center gap-2 animate-pulse"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {isCompleting ? 'Verwerken...' : 'Markeer als Voltooid'}
                                </button>
                            ) : (
                                <button className="btn btn-success px-8 py-3 rounded-full flex items-center gap-2 text-white">
                                    <ChevronRight className="w-5 h-5" /> Volgende Les
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Sidebar */}
                    <div className="space-y-4">
                        <div className="card p-4">
                            <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Module Overzicht</h3>
                            <div className="space-y-2">
                                {lesson.module.lessons.map((m: any) => (
                                    <Link
                                        key={m.id}
                                        href={`/training/lesson/${m.id}`}
                                        className={`block p-3 rounded-lg text-sm transition-all ${m.id === lesson.id ? 'bg-primary text-white font-bold' : 'hover:bg-light-200 text-dark-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {m.id === lesson.id ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-30" />}
                                            <span className="line-clamp-1">{m.title}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
