'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Plus, Trash2, ImagePlus } from 'lucide-react';
import Link from 'next/link';

function LessonBuilderContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

    const [module, setModule] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [duration, setDuration] = useState('');
    const [quizQuestion, setQuizQuestion] = useState('');
    const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!canAccessAdmin) {
            router.push('/training');
            return;
        }
        if (lessonId) {
            fetchLesson();
        } else if (moduleId) {
            fetchModule();
        } else {
            router.push('/training');
        }
    }, [moduleId, lessonId]);

    async function fetchLesson() {
        try {
            const res = await fetch(`/api/training/lessons/${lessonId}`);
            if (res.ok) {
                const lesson = await res.json();
                setTitle(lesson.title);
                setContent(lesson.content || '');
                setVideoUrl(lesson.videoUrl || '');
                setDuration(lesson.duration ? lesson.duration.toString() : '');

                // Parse quiz if exists
                if (lesson.quiz) {
                    try {
                        const quizData = JSON.parse(lesson.quiz);
                        setQuizQuestion(quizData.question || '');
                        setQuizOptions(quizData.options || ['', '', '', '']);
                        setCorrectAnswer(quizData.correct || 0);
                    } catch (e) {
                        console.error('Failed to parse quiz', e);
                    }
                }

                // Fetch module data
                const moduleRes = await fetch(`/api/training/modules/${lesson.moduleId}`);
                if (moduleRes.ok) {
                    const moduleData = await moduleRes.json();
                    setModule(moduleData);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchModule() {
        try {
            const res = await fetch(`/api/training/modules/${moduleId}`);
            if (res.ok) {
                const data = await res.json();
                setModule(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...quizOptions];
        newOptions[index] = value;
        setQuizOptions(newOptions);
    };

    const handleSave = async () => {
        setError('');
        if (!title) {
            setError('Titel is verplicht');
            return;
        }

        if (!content && !videoUrl) {
            setError('Content of video is verplicht');
            return;
        }

        // Validate quiz if question is provided
        if (quizQuestion) {
            const filledOptions = quizOptions.filter(opt => opt.trim() !== '');
            if (filledOptions.length < 2) {
                setError('Minimaal 2 antwoord opties nodig voor quiz');
                return;
            }
        }

        setIsSaving(true);
        try {
            // Prepare quiz JSON
            let quizData = null;
            if (quizQuestion) {
                const filledOptions = quizOptions.filter(opt => opt.trim() !== '');
                quizData = JSON.stringify({
                    question: quizQuestion,
                    options: filledOptions,
                    correct: correctAnswer
                });
            }

            const method = lessonId ? 'PATCH' : 'POST';
            const url = lessonId ? `/api/training/lessons/${lessonId}` : '/api/training/lessons';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moduleId: moduleId || module.id,
                    title,
                    content: content || null,
                    videoUrl: videoUrl || null,
                    quiz: quizData,
                    duration: duration ? parseInt(duration) : null,
                    order: 0
                }),
            });

            if (res.ok) {
                const lesson = await res.json();
                router.push(`/training/${module.courseId}?edit=true`);
            } else {
                const data = await res.json();
                setError(data.error || 'Fout bij opslaan');
            }
        } catch (error) {
            console.error(error);
            setError('Fout bij opslaan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !module) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link href={`/training/${module.courseId}?edit=true`} className="flex items-center gap-2 text-dark-100 hover:text-primary mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Terug naar cursus
                </Link>

                <div className="card p-8">
                    <h1 className="text-3xl font-bold text-dark mb-2">{lessonId ? 'Les Bewerken' : 'Nieuwe Les Maken'}</h1>
                    <p className="text-dark-100 mb-8">Module: <strong>{module.title}</strong></p>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">
                                Les Titel *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Bv. Introductie tot klantgericht werken"
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">
                                Duur (minuten)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Bv. 15"
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Video URL */}
                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">
                                Video URL (optioneel)
                            </label>
                            <input
                                type="text"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="YouTube, Vimeo, of andere video URL"
                                className="input input-bordered w-full"
                            />
                            {videoUrl && (
                                <p className="text-xs text-dark-100 mt-1">Preview wordt getoond in les</p>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">
                                Les Content *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Schrijf de les content hier... Je kunt afbeeldingen embedden door image URLs op aparte regels te plaatsen."
                                rows={12}
                                className="textarea textarea-bordered w-full resize-none font-mono text-sm"
                            />
                            <p className="text-xs text-dark-100 mt-1">
                                Tip: Gebruik line breaks voor paragrafen. Afbeelding URLs worden automatisch gerenderd.
                            </p>
                        </div>

                        {/* Quiz Section */}
                        <div className="border-t border-light-300 pt-6">
                            <h2 className="text-xl font-bold text-dark mb-4">Kennis Check (optioneel)</h2>
                            <p className="text-sm text-dark-100 mb-4">
                                Voeg een quiz vraag toe aan het einde van de les. Gebruikers moeten deze correct beantwoorden om verder te gaan.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-2">
                                        Quiz Vraag
                                    </label>
                                    <input
                                        type="text"
                                        value={quizQuestion}
                                        onChange={(e) => setQuizQuestion(e.target.value)}
                                        placeholder="Wat is het belangrijkste principe van klantgericht werken?"
                                        className="input input-bordered w-full"
                                    />
                                </div>

                                {quizQuestion && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-dark mb-2">
                                                Antwoord Opties
                                            </label>
                                            {quizOptions.map((option, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={correctAnswer === idx}
                                                        onChange={() => setCorrectAnswer(idx)}
                                                        className="radio radio-primary"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                        placeholder={`Optie ${idx + 1}`}
                                                        className="input input-bordered flex-1"
                                                    />
                                                </div>
                                            ))}
                                            <p className="text-xs text-dark-100">
                                                Selecteer het correcte antwoord door op de radio button te klikken
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-6 border-t border-light-300">
                            <button
                                onClick={() => router.back()}
                                className="btn btn-ghost flex-1"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Opslaan...' : 'Les Opslaan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LessonBuilderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <LessonBuilderContent />
        </Suspense>
    );
}
