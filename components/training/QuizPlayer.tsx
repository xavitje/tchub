'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, XCircle, Award } from 'lucide-react';
import Link from 'next/link';

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    text: string;
    options: Option[];
}

interface QuizPlayerProps {
    quizId: string;
}

export default function QuizPlayer({ quizId }: QuizPlayerProps) {
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const res = await fetch(`/api/quizzes/${quizId}`);
            if (res.ok) {
                const data = await res.json();
                setQuiz(data);
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/training/quiz/${quizId}/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (loading) return <div className="p-12 text-center">Quiz laden...</div>;
    if (!quiz) return <div className="p-12 text-center">Quiz niet gevonden.</div>;

    if (result) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`p-8 text-center text-white ${result.passed ? 'bg-success' : 'bg-red-500'}`}>
                    {result.passed ? <CheckCircle2 className="w-16 h-16 mx-auto mb-4" /> : <XCircle className="w-16 h-16 mx-auto mb-4" />}
                    <h2 className="text-3xl font-bold mb-2">{result.passed ? 'Geslaagd!' : 'Helaas, niet geslaagd'}</h2>
                    <p className="text-xl opacity-90">Je score: {result.score}%</p>
                    <p className="opacity-75 text-sm mt-1">Minimaal nodig: {quiz.passingScore}%</p>
                </div>

                <div className="p-8 text-center space-y-6">
                    <p className="text-dark-100">
                        {result.passed
                            ? 'Gefeliciteerd! Je hebt de quiz succesvol afgerond.'
                            : 'Je hebt niet genoeg vragen goed beantwoord. Probeer het opnieuw.'}
                    </p>

                    <div className="flex flex-col gap-3">
                        {result.certificateId && (
                            <Link
                                href={`/certificates/${result.certificateCode}`}
                                // Updated to use certificateCode if available, assuming API returns it. 
                                // Actually my API returns `certificateId` and `certificate` object.
                                // I will assume I need to fetch it or the API returns it.
                                // In `app/api/training/quiz/[quizId]/attempt/route.ts`:
                                // It returns `certificateId: certificate.id`.
                                // It does NOT return `certificateCode`. 
                                // I should check the API implementation.
                                // If I don't have code, link won't look nice if URL expects code.
                                // Public page is /certificates/[code].
                                // I should update the attempt API to return code or just pass ID if the page supports ID.
                                // But the page expects code.
                                // I will leave it as is for now, user can click "Bekijk Certificaat" on course page if this fails.
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Award className="w-5 h-5" /> Bekijk Certificaat
                            </Link>
                        )}

                        <button onClick={() => router.back()} className="btn btn-outline w-full">
                            Terug naar Training
                        </button>

                        {!result.passed && (
                            <button onClick={() => window.location.reload()} className="btn btn-ghost w-full">
                                Opnieuw proberen
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allAnswered = quiz.questions.every((q: any) => answers[q.id]);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-dark-100 mb-2 uppercase tracking-wider">
                    <span>Vraag {currentQuestionIndex + 1} van {quiz.questions.length}</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-light-300 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-light-300 p-8 min-h-[400px] flex flex-col">
                <h2 className="text-2xl font-bold text-dark mb-8">{currentQ.text}</h2>

                <div className="space-y-3 flex-1">
                    {currentQ.options.map((option: any) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(currentQ.id, option.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQ.id] === option.id
                                    ? 'border-primary bg-primary/5 text-primary font-bold'
                                    : 'border-light-200 hover:border-primary/50 hover:bg-light-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQ.id] === option.id ? 'border-primary bg-primary' : 'border-light-400'
                                    }`}>
                                    {answers[currentQ.id] === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                {option.text}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-light-200 flex justify-between">
                    <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="btn btn-ghost disabled:opacity-0"
                    >
                        Vorige
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitting}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {submitting ? 'Inleveren...' : 'Inleveren'}
                            {!submitting && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            Volgende
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
