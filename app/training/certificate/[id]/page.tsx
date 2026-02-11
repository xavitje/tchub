'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Share2, Award, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSession } from 'next-auth/react';

export default function CertificatePage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        // Fetch course details
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

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            // A4 landscape: 297mm x 210mm
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-${course.title.replace(/\s+/g, '-')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-light flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!course) return (
        <div className="min-h-screen bg-light flex items-center justify-center">
            <p>Cursus niet gevonden of certificaat niet beschikbaar.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-light py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <Link href={`/training/${params.id}`} className="btn btn-outline flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Terug naar Cursus
                    </Link>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="btn btn-primary flex items-center gap-2 shadow-lg"
                        >
                            {isDownloading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Download PDF
                        </button>
                        <button className="btn btn-outline flex items-center gap-2 bg-white">
                            <Share2 className="w-4 h-4" /> Deel prestatie
                        </button>
                    </div>
                </div>

                {/* Certificate Preview Wrapper */}
                <div className="flex justify-center overflow-auto py-8">
                    {/* The Certificate itself */}
                    <div
                        ref={certificateRef}
                        className="bg-white text-dark w-[1123px] h-[794px] p-20 relative shadow-2xl border-[16px] border-double border-primary/20 flex flex-col items-center justify-center text-center shrink-0"
                        style={{ fontFamily: 'serif' }}
                    >
                        {/* Decorative Corners */}
                        <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-primary/30" />
                        <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-primary/30" />
                        <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-primary/30" />
                        <div className="absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-primary/30" />

                        {/* Background Watermark/Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                            <Award className="w-[500px] h-[500px]" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center w-full h-full justify-between py-12">

                            {/* Top Section */}
                            <div className="space-y-6">
                                <div className="bg-primary/5 p-6 rounded-full inline-block mb-4">
                                    <Award className="w-24 h-24 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold tracking-[0.4em] uppercase text-primary">Certificaat van Voltooiing</h2>
                                <p className="text-2xl text-dark-100 font-medium italic">Hierbij wordt verklaard dat</p>
                            </div>

                            {/* Name Section */}
                            <div className="w-full">
                                <h1 className="text-6xl font-black text-dark py-4 px-12 border-b-2 border-primary/20 inline-block min-w-[50%]">
                                    {session?.user?.name || 'Travel Counsellor'}
                                </h1>
                            </div>

                            {/* Course Section */}
                            <div className="space-y-4">
                                <p className="text-2xl text-dark-100 italic">succesvol de training heeft afgerond:</p>
                                <h3 className="text-5xl font-bold text-primary-700 max-w-4xl mx-auto leading-tight">
                                    {course.title}
                                </h3>
                            </div>

                            {/* Signatures / Date */}
                            <div className="w-full grid grid-cols-2 gap-32 pt-16 px-20">
                                <div className="text-center">
                                    <div className="border-b-2 border-dark pb-2 mb-2 font-bold text-2xl">
                                        {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <span className="text-sm uppercase font-bold text-dark-100 tracking-widest">Datum</span>
                                </div>
                                <div className="text-center">
                                    <div className="border-b-2 border-dark pb-2 mb-2 font-bold text-2xl italic font-serif">
                                        HubTC Academy
                                    </div>
                                    <span className="text-sm uppercase font-bold text-dark-100 tracking-widest">Ondertekend</span>
                                </div>
                            </div>

                            {/* Stars */}
                            <div className="flex gap-2 text-warning mt-8">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-current" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
