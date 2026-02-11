'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Award, Download, Share2, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

export default function CertificatePage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourse() {
            try {
                const res = await fetch(`/api/training/${params.id}`);
                const data = await res.json();
                setCourse(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourse();
    }, [params.id]);

    if (loading) return <div className="min-h-screen bg-light flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!course) return <div className="min-h-screen bg-light p-8 text-center"><p>Ops! We kunnen dit certificaat niet vinden.</p></div>;

    return (
        <div className="min-h-screen bg-light py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href={`/training/${params.id}`} className="flex items-center gap-2 text-dark-100 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Terug naar cursus
                    </Link>
                </div>

                {/* Certificate Card */}
                <div className="bg-white p-12 md:p-20 rounded-[2rem] shadow-2xl border-t-[12px] border-primary relative overflow-hidden text-center">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Award className="w-64 h-64" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-8 opacity-5">
                        <Award className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-center mb-6">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <Award className="w-20 h-20 text-primary" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-primary">Certificaat van Voltooiing</h2>
                            <p className="text-dark-100 font-medium">Dit bewijs is uitgereikt aan</p>
                        </div>

                        <h1 className="text-5xl font-black text-dark py-4">
                            {session?.user?.name || 'Travel Counsellor'}
                        </h1>

                        <div className="w-24 h-1 bg-primary/20 mx-auto"></div>

                        <p className="text-lg text-dark-100 max-w-xl mx-auto">
                            voor het succesvol afronden van de professionele training
                        </p>

                        <h3 className="text-3xl font-bold text-dark italic">
                            "{course.title}"
                        </h3>

                        <div className="pt-12 grid grid-cols-2 gap-8 max-w-md mx-auto">
                            <div className="text-center">
                                <div className="border-b-2 border-primary/20 pb-2 mb-2 font-bold text-dark">
                                    {new Date().toLocaleDateString('nl-NL')}
                                </div>
                                <span className="text-[10px] uppercase font-bold text-dark-100 tracking-widest">Datum</span>
                            </div>
                            <div className="text-center">
                                <div className="border-b-2 border-primary/20 pb-2 mb-2 font-bold text-dark italic font-serif">
                                    HubTC Academy
                                </div>
                                <span className="text-[10px] uppercase font-bold text-dark-100 tracking-widest">Gevalideerd door</span>
                            </div>
                        </div>

                        <div className="pt-12 flex items-center justify-center gap-1 text-warning">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <button className="btn btn-primary px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Download className="w-5 h-5" /> Download PDF
                    </button>
                    <button className="btn btn-outline px-8 py-3 rounded-xl flex items-center gap-2 bg-white">
                        <Share2 className="w-5 h-5" /> Deel prestatie
                    </button>
                </div>
            </div>
        </div>
    );
}
