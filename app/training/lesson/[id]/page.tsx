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
    const [quiz, setQuiz] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [quizPassed, setQuizPassed] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        fetchLesson();
    }, [params.id]);

    async function fetchLesson() {
        try {
            const res = await fetch(`/api/training/lessons/${params.id}`);
            const data = await res.json();
            setLesson(data);

            if (data.quiz) {
                try {
                    setQuiz(JSON.parse(data.quiz));
                } catch (e) {
                    console.error("Failed to parse quiz", e);
                }
            } else {
                setQuiz(null);
                setQuizPassed(true); // No quiz means auto-pass logic for button enablement
            }

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

    const handleQuizSubmit = () => {
        if (selectedOption === null || !quiz) return;

        if (selectedOption === quiz.correct) {
            setQuizPassed(true);
            setShowError(false);
        } else {
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
        }
    };

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

                            <div className="prose max-w-none text-dark-100 whitespace-pre-line leading-relaxed mb-8">
                                {lesson.content}
                            </div>

                            {/* QUIZ SECTION */}
                            {quiz && !isCompleted && (
                                <div className={`card p-6 border-l-4 ${quizPassed ? 'border-success bg-success/5' : 'border-primary bg-primary/5'} transition-all`}>
                                    <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-dark">
                                        <Award className={`w-5 h-5 ${quizPassed ? 'text-success' : 'text-primary'}`} />
                                        Kennis Check
                                    </h3>

                                    {!quizPassed ? (
                                        <div className="space-y-4">
                                            <p className="font-medium text-dark">{quiz.question}</p>
                                            <div className="space-y-2">
                                                {quiz.options.map((opt: string, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedOption(idx)}
                                                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedOption === idx
                                                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                                                : 'border-light-300 hover:bg-white hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                {showError && <span className="text-error text-sm font-bold animate-pulse">Fout antwoord, probeer opnieuw!</span>}
                                                <button
                                                    onClick={handleQuizSubmit}
                                                    disabled={selectedOption === null}
                                                    className="btn btn-primary ml-auto"
                                                >
                                                    Controleer Antwoord
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 animate-bounce-in">
                                            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                                            <p className="font-bold text-success text-lg">Goed gedaan! Je hebt het begrepen.</p>
                                            <p className="text-sm text-dark-100">Je kunt de les nu afronden.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button className="btn btn-outline flex items-center gap-2 opacity-50 cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" /> Vorige
                            </button>

                            {!isCompleted ? (
                                <button
                                    onClick={handleComplete}
                                    disabled={isCompleting || (quiz && !quizPassed)}
                                    className={`btn px-8 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all ${(quiz && !quizPassed)
                                            ? 'bg-light-400 text-dark-100 cursor-not-allowed opacity-50'
                                            : 'btn-primary animate-pulse shadow-primary/20'
                                        }`}
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {isCompleting ? 'Verwerken...' : (quiz && !quizPassed ? 'Eerst Quiz Maken' : 'Markeer als Voltooid')}
                                </button>
                            ) : (
                                lesson.nextLessonId ? (
                                    <Link
                                        href={`/training/lesson/${lesson.nextLessonId}`}
                                        className="btn btn-success text-white px-8 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-success/20 hover:scale-105 transition-transform"
                                    >
                                        Volgende Les <ChevronRight className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={`/training/${lesson.module.courseId}`}
                                        className="btn btn-success text-white px-8 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-success/20 hover:scale-105 transition-transform"
                                    >
                                        Cursus Afronden <Award className="w-5 h-5" />
                                    </Link>
                                )
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
