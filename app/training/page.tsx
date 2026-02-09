import { BookOpen, Video, FileText, Award } from 'lucide-react';

export default function TrainingPage() {
    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-dark mb-6">Training & Ontwikkeling</h1>

                {/* Training Categories */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <BookOpen className="w-8 h-8 text-primary mb-2" />
                        <h3 className="font-semibold text-dark">Alle Trainingen</h3>
                        <p className="text-sm text-dark-100 mt-1">42 beschikbaar</p>
                    </button>
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <Video className="w-8 h-8 text-info mb-2" />
                        <h3 className="font-semibold text-dark">Video Cursussen</h3>
                        <p className="text-sm text-dark-100 mt-1">18 cursussen</p>
                    </button>
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <FileText className="w-8 h-8 text-success mb-2" />
                        <h3 className="font-semibold text-dark">Documenten</h3>
                        <p className="text-sm text-dark-100 mt-1">67 resources</p>
                    </button>
                    <button className="card p-4 hover:shadow-medium transition-all text-left">
                        <Award className="w-8 h-8 text-warning mb-2" />
                        <h3 className="font-semibold text-dark">Certificeringen</h3>
                        <p className="text-sm text-dark-100 mt-1">8 programma's</p>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Featured Training */}
                        <div>
                            <h2 className="text-xl font-semibold text-dark mb-4">Aanbevolen Trainingen</h2>
                            <div className="space-y-4">
                                {[
                                    {
                                        title: 'Customer Service Excellence',
                                        description: 'Leer de beste praktijken voor uitzonderlijke klantservice',
                                        duration: '2 uur',
                                        level: 'Beginner',
                                        enrolled: 234,
                                    },
                                    {
                                        title: 'Advanced Sales Techniques',
                                        description: 'Geavanceerde verkooptechnieken voor ervaren consultants',
                                        duration: '3 uur',
                                        level: 'Gevorderd',
                                        enrolled: 156,
                                    },
                                    {
                                        title: 'Digital Marketing Fundamentals',
                                        description: 'Basis van digitale marketing voor travel consultants',
                                        duration: '1.5 uur',
                                        level: 'Beginner',
                                        enrolled: 189,
                                    },
                                ].map((training, i) => (
                                    <div key={i} className="card p-6 hover:shadow-medium transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-dark mb-2">
                                                    {training.title}
                                                </h3>
                                                <p className="text-dark-100 mb-3">{training.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-dark-100">
                                                    <span className="flex items-center gap-1">
                                                        ⏱️ {training.duration}
                                                    </span>
                                                    <span className="badge bg-primary-50 text-primary">
                                                        {training.level}
                                                    </span>
                                                    <span>{training.enrolled} deelnemers</span>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary ml-4">
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Trainings */}
                        <div>
                            <h2 className="text-xl font-semibold text-dark mb-4">Recent Toegevoegd</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    'Social Media Marketing',
                                    'Time Management',
                                    'Conflict Resolution',
                                    'Product Knowledge Update',
                                ].map((title, i) => (
                                    <div key={i} className="card p-4 hover:shadow-medium transition-shadow">
                                        <h3 className="font-semibold text-dark mb-2">{title}</h3>
                                        <p className="text-sm text-dark-100 mb-3">
                                            Nieuw toegevoegd aan de training bibliotheek
                                        </p>
                                        <button className="text-sm text-primary hover:underline">
                                            Meer info →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* My Progress */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Mijn Voortgang</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-dark">Voltooide Trainingen</span>
                                        <span className="text-sm font-bold text-primary">12</span>
                                    </div>
                                    <div className="w-full bg-light-300 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-dark">Certificaten Behaald</span>
                                        <span className="text-sm font-bold text-success">3</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-dark">Totale Studietijd</span>
                                        <span className="text-sm font-bold text-info">24 uur</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-outline w-full mt-4">
                                Bekijk profiel
                            </button>
                        </div>

                        {/* Upcoming Sessions */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Aankomende Sessies</h3>
                            <div className="space-y-3">
                                {[
                                    { title: 'Live Webinar: Q1 Updates', date: 'Morgen, 14:00' },
                                    { title: 'Workshop: Sales Skills', date: '8 Feb, 10:00' },
                                    { title: 'Masterclass: Leadership', date: '12 Feb, 15:00' },
                                ].map((session, i) => (
                                    <div key={i} className="p-3 bg-light-200 rounded-lg">
                                        <p className="font-medium text-dark text-sm">{session.title}</p>
                                        <p className="text-xs text-dark-100 mt-1">{session.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Handige Links</h3>
                            <div className="space-y-2">
                                {[
                                    'Training Catalogus',
                                    'Certificering Overzicht',
                                    'Learning Paths',
                                    'FAQ & Support',
                                ].map((link, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="block p-2 rounded-lg hover:bg-light-200 text-dark-100 hover:text-primary transition-colors text-sm"
                                    >
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
