export interface SearchResult {
    id: string;
    type: 'USER' | 'POST' | 'HUB' | 'FAQ' | 'TRAINING' | 'TICKET' | 'STATUS';
    title: string;
    description?: string;
    url: string;
    icon?: string;
    metadata?: any;
}

export const FAQs = [
    {
        id: 'faq-password',
        question: 'Hoe reset ik mijn wachtwoord?',
        answer: 'Ga naar de login pagina en klik op "Wachtwoord vergeten". Volg de instructies in de email.',
        url: '/support'
    },
    {
        id: 'faq-post',
        question: 'Hoe maak ik een nieuw bericht aan?',
        answer: 'Klik op de "Nieuw bericht" knop in de navigatie of op de Discussies pagina.',
        url: '/support'
    },
    {
        id: 'faq-favorite',
        question: 'Kan ik berichten opslaan als favoriet?',
        answer: 'Ja, klik op het bookmark icoon bij elk bericht om het op te slaan in je favorieten.',
        url: '/support'
    },
    {
        id: 'faq-event',
        question: 'Hoe meld ik me aan voor een event?',
        answer: 'Open het event en klik op de "Aanmelden" knop. Je ontvangt een bevestiging via email.',
        url: '/support'
    }
];

export const TRAININGS = [
    {
        id: 'tr-customer-service',
        title: 'Customer Service Excellence',
        description: 'Leer de beste praktijken voor uitzonderlijke klantservice',
        level: 'Beginner',
        url: '/training'
    },
    {
        id: 'tr-advanced-sales',
        title: 'Advanced Sales Techniques',
        description: 'Geavanceerde verkooptechnieken voor ervaren consultants',
        level: 'Gevorderd',
        url: '/training'
    },
    {
        id: 'tr-digital-marketing',
        title: 'Digital Marketing Fundamentals',
        description: 'Basis van digitale marketing voor travel consultants',
        level: 'Beginner',
        url: '/training'
    },
    {
        id: 'tr-social-media',
        title: 'Social Media Marketing',
        description: 'Basis van social media marketing voor travel consultants',
        level: 'Beginner',
        url: '/training'
    }
];

export const PLATFORM_STATUS = [
    {
        id: 'status-operational',
        title: 'Systeem Status: Alle systemen operationeel',
        description: 'Geen bekende storingen op dit moment.',
        url: '/platform-status',
        status: 'UP'
    }
];

export const SUPPORT_TICKETS = [
    {
        id: 'ticket-1234',
        title: 'Ticket #1234: Probleem met notificaties',
        description: 'Status: Open - In behandeling door support team.',
        url: '/support'
    },
    {
        id: 'ticket-1189',
        title: 'Ticket #1189: Vraag over training certificaat',
        description: 'Status: Opgelost - Certificaat is opgestuurd.',
        url: '/support'
    }
];
