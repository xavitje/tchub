'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Option {
    text: string;
    isCorrect: boolean;
}

interface Question {
    text: string;
    type: 'MULTIPLE_CHOICE'; // Extend later
    options: Option[];
}

interface QuizBuilderProps {
    moduleId?: string;
    courseId?: string;
    onCancel: () => void;
}

export default function QuizBuilder({ moduleId, courseId, onCancel }: QuizBuilderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Quiz State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [passingScore, setPassingScore] = useState(60);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        fetchQuiz();
    }, [moduleId, courseId]);

    const fetchQuiz = async () => {
        try {
            const url = moduleId
                ? `/api/training/modules/${moduleId}/quiz`
                : `/api/training/${courseId}/final-exam`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setPassingScore(data.passingScore || 60);
                    // Map questions from DB format to State format
                    if (data.questions) {
                        setQuestions(data.questions.map((q: any) => ({
                            text: q.text,
                            type: q.type,
                            options: q.options.map((o: any) => ({
                                text: o.text,
                                isCorrect: o.isCorrect
                            }))
                        })));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setFetching(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            text: '',
            type: 'MULTIPLE_CHOICE',
            options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
        }]);
    };

    const removeQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQ = [...questions];
        (newQ[index] as any)[field] = value;
        setQuestions(newQ);
    };

    const addOption = (qIndex: number) => {
        const newQ = [...questions];
        newQ[qIndex].options.push({ text: '', isCorrect: false });
        setQuestions(newQ);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQ = [...questions];
        newQ[qIndex].options.splice(oIndex, 1);
        setQuestions(newQ);
    };

    const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
        const newQ = [...questions];
        (newQ[qIndex].options[oIndex] as any)[field] = value;
        setQuestions(newQ);
    };

    const saveQuiz = async () => {
        setLoading(true);
        try {
            const url = moduleId
                ? `/api/training/modules/${moduleId}/quiz`
                : `/api/training/${courseId}/final-exam`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    passingScore,
                    questions
                })
            });

            if (!res.ok) throw new Error('Failed to save quiz');

            alert('Quiz succesvol opgeslagen!');
            onCancel(); // Go back
            router.refresh();
        } catch (error) {
            console.error('Error saving quiz:', error);
            alert('Fout bij opslaan quiz');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Laden...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-light-300 overflow-hidden">
            <div className="p-6 border-b border-light-300 flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="text-xl font-bold text-dark">{moduleId ? 'Module Quiz Bewerken' : 'Eindexamen Bewerken'}</h2>
                    <p className="text-sm text-dark-100">Beheer vragen en instellingen</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="btn btn-ghost">Annuleren</button>
                    <button onClick={saveQuiz} disabled={loading} className="btn btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {loading ? 'Opslaan...' : 'Opslaan'}
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Check if creating NEW or Editing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Quiz Titel</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Bijv. Module 1 Kennis Test"
                        />
                    </div>
                    <div>
                        <label className="label">Slagingspercentage (%)</label>
                        <input
                            type="number"
                            className="input w-full"
                            value={passingScore}
                            onChange={e => setPassingScore(Number(e.target.value))}
                            min="0" max="100"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label">Beschrijving (Optioneel)</label>
                        <textarea
                            className="input w-full min-h-[80px]"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Instructies voor de student..."
                        />
                    </div>
                </div>

                <div className="border-t border-light-300 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-dark">Vragen ({questions.length})</h3>
                        <button onClick={addQuestion} className="btn btn-outline btn-sm flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Vraag Toevoegen
                        </button>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-light-50 p-4 rounded-lg border border-light-300 relative group">
                                <button
                                    onClick={() => removeQuestion(qIndex)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <div className="mb-4 pr-8">
                                    <label className="label text-xs uppercase tracking-wider font-bold mb-1">Vraag {qIndex + 1}</label>
                                    <input
                                        type="text"
                                        className="input w-full font-medium"
                                        value={q.text}
                                        onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                        placeholder="Typ hier de vraag..."
                                    />
                                </div>

                                <div className="space-y-2 pl-4 border-l-2 border-light-300">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateOption(qIndex, oIndex, 'isCorrect', !opt.isCorrect)}
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${opt.isCorrect ? 'bg-success border-success text-white' : 'border-light-400 text-transparent hover:border-success'
                                                    }`}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="text"
                                                className={`input flex-1 py-1 ${opt.isCorrect ? 'border-success ring-1 ring-success/20' : ''}`}
                                                value={opt.text}
                                                onChange={e => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                placeholder={`Optie ${oIndex + 1}`}
                                            />
                                            <button
                                                onClick={() => removeOption(qIndex, oIndex)}
                                                className="text-light-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addOption(qIndex)} className="text-sm text-primary hover:underline pl-9 flex items-center gap-1 mt-2">
                                        <Plus className="w-3 h-3" /> Optie toevoegen
                                    </button>
                                </div>
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <div className="text-center py-8 text-dark-100 border-2 border-dashed border-light-300 rounded-lg">
                                Nog geen vragen toegevoegd.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
