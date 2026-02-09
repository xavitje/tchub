import { HelpCircle, MessageCircle, FileText, Search } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-dark mb-6">Support Portal</h1>

                {/* Search Bar */}
                <div className="card p-6 mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-100" />
                        <input
                            type="text"
                            placeholder="Zoek in de kennisbank..."
                            className="input pl-12"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button className="card p-6 hover:shadow-medium transition-all text-left">
                        <HelpCircle className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold text-dark mb-2">Stel een Vraag</h3>
                        <p className="text-sm text-dark-100">
                            Krijg hulp van ons support team
                        </p>
                    </button>
                    <button className="card p-6 hover:shadow-medium transition-all text-left">
                        <MessageCircle className="w-8 h-8 text-info mb-3" />
                        <h3 className="font-semibold text-dark mb-2">Live Chat</h3>
                        <p className="text-sm text-dark-100">
                            Chat direct met een support medewerker
                        </p>
                    </button>
                    <button className="card p-6 hover:shadow-medium transition-all text-left">
                        <FileText className="w-8 h-8 text-success mb-3" />
                        <h3 className="font-semibold text-dark mb-2">Documentatie</h3>
                        <p className="text-sm text-dark-100">
                            Bekijk handleidingen en tutorials
                        </p>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* FAQ */}
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-dark mb-4">
                                Veelgestelde Vragen
                            </h2>
                            <div className="space-y-4">
                                {[
                                    {
                                        question: 'Hoe reset ik mijn wachtwoord?',
                                        answer: 'Ga naar de login pagina en klik op "Wachtwoord vergeten". Volg de instructies in de email.',
                                    },
                                    {
                                        question: 'Hoe maak ik een nieuw bericht aan?',
                                        answer: 'Klik op de "Nieuw bericht" knop in de navigatie of op de Discussies pagina.',
                                    },
                                    {
                                        question: 'Kan ik berichten opslaan als favoriet?',
                                        answer: 'Ja, klik op het bookmark icoon bij elk bericht om het op te slaan in je favorieten.',
                                    },
                                    {
                                        question: 'Hoe meld ik me aan voor een event?',
                                        answer: 'Open het event en klik op de "Aanmelden" knop. Je ontvangt een bevestiging via email.',
                                    },
                                ].map((faq, i) => (
                                    <details key={i} className="group">
                                        <summary className="flex items-center justify-between cursor-pointer p-4 bg-light-200 rounded-lg hover:bg-light-300 transition-colors">
                                            <span className="font-medium text-dark">{faq.question}</span>
                                            <span className="text-primary group-open:rotate-180 transition-transform">
                                                ▼
                                            </span>
                                        </summary>
                                        <div className="p-4 text-dark-100">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>

                        {/* Recent Tickets */}
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-dark mb-4">
                                Mijn Support Tickets
                            </h2>
                            <div className="space-y-3">
                                {[
                                    {
                                        id: '#1234',
                                        title: 'Probleem met notificaties',
                                        status: 'Open',
                                        date: '2 feb 2026',
                                    },
                                    {
                                        id: '#1189',
                                        title: 'Vraag over training certificaat',
                                        status: 'Opgelost',
                                        date: '28 jan 2026',
                                    },
                                ].map((ticket, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-light-200 rounded-lg">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-mono text-dark-100">{ticket.id}</span>
                                                <span className={`badge ${ticket.status === 'Open'
                                                        ? 'bg-warning/20 text-warning'
                                                        : 'bg-success/20 text-success'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="font-medium text-dark">{ticket.title}</p>
                                            <p className="text-xs text-dark-100 mt-1">{ticket.date}</p>
                                        </div>
                                        <button className="text-primary hover:underline text-sm">
                                            Bekijk →
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-outline w-full mt-4">
                                Alle tickets bekijken
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Contact</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-dark-100 mb-1">Email Support</p>
                                    <a href="mailto:support@travelcounsellors.com" className="text-primary hover:underline">
                                        support@travelcounsellors.com
                                    </a>
                                </div>
                                <div>
                                    <p className="text-dark-100 mb-1">Telefoon</p>
                                    <a href="tel:+31201234567" className="text-primary hover:underline">
                                        +31 20 123 4567
                                    </a>
                                </div>
                                <div>
                                    <p className="text-dark-100 mb-1">Openingstijden</p>
                                    <p className="text-dark">Ma-Vr: 09:00 - 17:00</p>
                                </div>
                            </div>
                        </div>

                        {/* Popular Articles */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">
                                Populaire Artikelen
                            </h3>
                            <div className="space-y-2">
                                {[
                                    'Aan de slag met HubTC',
                                    'Notificaties instellen',
                                    'Profiel aanpassen',
                                    'Events organiseren',
                                    'Polls aanmaken',
                                ].map((article, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="block p-2 rounded-lg hover:bg-light-200 text-dark-100 hover:text-primary transition-colors text-sm"
                                    >
                                        {article}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">
                                Systeem Status
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-3 h-3 bg-success rounded-full"></span>
                                <span className="text-sm font-medium text-dark">Alle systemen operationeel</span>
                            </div>
                            <a href="/platform-status" className="text-sm text-primary hover:underline">
                                Bekijk status pagina →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
