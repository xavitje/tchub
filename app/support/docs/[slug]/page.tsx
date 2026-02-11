'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function DocumentationArticlePage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Mock data for articles - in a real app this would come from an API or MDX files
    const articles: Record<string, any> = {
        'account-setup': {
            title: 'Inloggen en account beheer',
            category: 'Aan de slag',
            readTime: '4 min',
            updatedAt: '2024-02-10',
            content: `
                Dit artikel legt uit hoe je voor de eerste keer inlogt op de Hub en je account instellingen beheert.
                
                ### Eerste keer inloggen
                Je kunt inloggen met je standaard @travelcounsellors.com e-mailadres. We gebruiken Single Sign-On (SSO), 
                wat betekent dat je geen apart wachtwoord hoeft aan te maken. Je gebruikt dezelfde gegevens als voor Outlook.
                
                ### Tweestapsverificatie (MFA)
                Als MFA is ingeschakeld voor je Microsoft account, zul je ook bij het inloggen op de Hub een verzoek 
                krijgen op je telefoon om de aanmelding te bevestigen.
                
                ### Problemen met inloggen?
                Mocht je problemen ervaren, controleer dan eerst of je nog wel bij je mail kunt. Als dat ook niet werkt,
                ligt het probleem waarschijnlijk bij je Microsoft account en raden we je aan contact op te nemen met IT.
            `
        },
        'profile-setup': {
            title: 'Je profiel instellen',
            category: 'Aan de slag',
            readTime: '3 min',
            updatedAt: '2024-02-08',
            content: `
                Een compleet profiel helpt collega's je sneller te vinden en te leren kennen.
                
                ### Profielfoto wijzigen
                Klik rechtsboven op je naam en ga naar 'Mijn Profiel'. Hier kun je een foto uploaden. Gebruik bij voorkeur
                een zakelijke, duidelijke foto waar je goed op staat.
                
                ### Functie en afdeling
                Deze gegevens worden automatisch gesynchroniseerd vanuit het personeelssysteem. Klopt er iets niet?
                Neem dan contact op met HR.
                
                ### Bio en Expertises
                Je kunt zelf een korte bio toevoegen en aangeven waar je veel vanaf weet. Dit maakt de 'Collega-zoeker'
                veel effectiever!
            `
        },
        'navigation': {
            title: 'Navigeren in de Hub',
            category: 'Aan de slag',
            readTime: '2 min',
            updatedAt: '2024-01-15',
            content: `
                De Hub is ontworpen om simpel en intuïtief te zijn. Hier is een kort overzicht:
                
                - **Home**: Het laatste nieuws en updates van de organisatie.
                - **Discussies**: De plek voor vragen, polls en kennisdeling met collega's.
                - **Training**: Volg cursussen en verbeter je vaardigheden.
                - **Hubs**: Toegang tot specifieke SharePoint omgevingen en documenten.
                - **Support**: Hulp nodig? Hier vind je alle antwoorden.
            `
        },
        'password-reset': {
            title: 'Wachtwoord wijzigen',
            category: 'Technisch',
            readTime: '2 min',
            updatedAt: '2024-02-01',
            content: `
                Omdat we Microsoft accounts gebruiken, wijzig je je wachtwoord via de Microsoft portal.
                
                1. Ga naar [myaccount.microsoft.com](https://myaccount.microsoft.com)
                2. Klik op 'Wachtwoord wijzigen'
                3. Volg de instructies op het scherm
                
                **Let op:** Na het wijzigen van je wachtwoord moet je mogelijk opnieuw inloggen op al je apparaten (Outlook, Teams, en de Hub).
            `
        },
        'vpn-setup': {
            title: 'VPN instellingen',
            category: 'Technisch',
            readTime: '5 min',
            updatedAt: '2024-01-20',
            content: `
                Voor toegang tot interne systemen vanaf huis heb je de VPN nodig.
                
                ### FortiClient installeren
                Op je werk-laptop staat standaard FortiClient geïnstalleerd. Open dit programma vanuit het startmenu.
                
                ### Verbinding maken
                1. Selecteer de 'TC Remote' verbinding
                2. Vul je e-mailadres en wachtwoord in
                3. Bevestig de MFA melding op je telefoon
            `
        },
        'leave-request': {
            title: 'Verlof aanvragen',
            category: 'HR & Beleid',
            readTime: '3 min',
            updatedAt: '2023-12-10',
            content: `
                Verlof aanvragen gaat via onze HR-portal. 
                
                ### Hoe werkt het?
                1. Log in op de HR Portal (link vind je onder Hubs > HR)
                2. Kies 'Nieuw verlof aanvragen'
                3. Selecteer de data en het type verlof
                
                Je leidinggevende krijgt automatisch een bericht en kan de aanvraag goedkeuren.
            `
        },
        'sick-leave': {
            title: 'Ziekmelding procedure',
            category: 'HR & Beleid',
            readTime: '2 min',
            updatedAt: '2023-11-05',
            content: `
                Ben je ziek? Dat is vervelend. Beterschap!
                
                ### Wat moet je doen?
                Meld je **voor 09:00 uur** telefonisch ziek bij je direct leidinggevende. Een appje of mailtje is 
                niet voldoende, tenzij dit expliciet zo is afgesproken binnen jouw team.
                
                Vergeet niet je ook weer beter te melden zodra je aan de slag gaat.
            `
        },
        'expenses': {
            title: 'Declaraties indienen',
            category: 'HR & Beleid',
            readTime: '4 min',
            updatedAt: '2024-01-10',
            content: `
                Onkosten gemaakt voor je werk? Declareer deze eenvoudig.
                
                ### Regels voor declareren
                Zorg dat je altijd een bonnetje of factuur meestuurt. Zonder officieel bewijs kan de administratie 
                de claim helaas niet verwerken.
                
                ### Indienen
                Ga naar Hubs > Finance en kies voor 'Onkosten declareren'. Hier kun je de foto van je bonnetje uploaden
                en de details invullen.
            `
        }
    };

    const article = articles[params.slug];

    if (!article) {
        return (
            <div className="min-h-screen bg-light p-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Artikel niet gevonden</h1>
                <Link href="/support/docs" className="text-primary hover:underline">Terug naar overzicht</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-dark-100 hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Terug naar overzicht
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <article className="lg:col-span-3 card p-8 md:p-12">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-4">
                            <BookOpen className="w-4 h-4" />
                            {article.category}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-6">{article.title}</h1>

                        <div className="flex items-center gap-6 text-sm text-dark-100 mb-8 pb-8 border-b border-light-300">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {article.readTime} leestijd
                            </div>
                            <div>
                                Laatst bijgewerkt: {new Date(article.updatedAt).toLocaleDateString('nl-NL')}
                            </div>
                        </div>

                        <div className="prose prose-primary max-w-none prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4">
                            <div className="text-dark-100 whitespace-pre-line leading-relaxed">
                                {article.content}
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-light-300">
                            <h4 className="font-bold text-dark mb-4">Was dit artikel nuttig?</h4>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-light-300 hover:bg-success/10 hover:border-success transition-all">
                                    <ThumbsUp className="w-4 h-4" />
                                    Ja
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-light-300 hover:bg-error/10 hover:border-error transition-all">
                                    <ThumbsDown className="w-4 h-4" />
                                    Nee
                                </button>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <div className="card p-6">
                            <h4 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Hulp nodig?</h4>
                            <p className="text-sm text-dark-100 mb-6">
                                Kun je niet vinden wat je zoekt? Onze support afdeling helpt je graag verder.
                            </p>
                            <Link href="/support/create" className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm">
                                <MessageCircle className="w-4 h-4" />
                                Stel een vraag
                            </Link>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <h4 className="font-bold text-primary mb-2 text-sm">Wist je dat?</h4>
                            <p className="text-xs text-primary/80 leading-relaxed">
                                Je ook vragen kunt stellen aan je collega's via de 'Discussies' tab op de homepage!
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
