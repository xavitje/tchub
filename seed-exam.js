const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FINAL_EXAM_QUESTIONS = [
    {
        question: "Wat is het belangrijkste verschil tussen een Team en een Kanaal in Microsoft Teams?",
        options: [
            "Er is geen verschil, het zijn synoniemen.",
            "Een Team is voor de hele organisatie, een Kanaal is privé.",
            "Een Team is een groep mensen (project/afdeling), een Kanaal is een specifiek gespreksonderwerp binnen dat Team.",
            "Kanalen zijn alleen voor video vergaderingen."
        ],
        correct: 2
    },
    {
        question: "Hoe kun je in Word tegelijkertijd met collega's in hetzelfde document werken?",
        options: [
            "Je moet het document eerst naar iedereen e-mailen.",
            "Je slaat het document op in OneDrive of SharePoint en deelt de link.",
            "Iedereen moet om de beurt het bestand openen.",
            "Je moet schermdeling gebruiken in Teams."
        ],
        correct: 1
    },
    {
        question: "Wat is een 'Draaitabel' (Pivot Table) in Excel?",
        options: [
            "Een tabel die je 90 graden kunt draaien.",
            "Een tool om grote hoeveelheden data snel samen te vatten, te analyseren en te presenteren.",
            "Een tabel met mooie kleuren en grafieken.",
            "Een formule om twee cellen bij elkaar op te tellen."
        ],
        correct: 1
    },
    {
        question: "Waarvoor dient de 'Versiegeschiedenis' in SharePoint?",
        options: [
            "Om te zien wie het document heeft bekeken.",
            "Om oude versies van een document te bekijken en eventueel te herstellen.",
            "Om te zien hoe vaak een document is geprint.",
            "Dit bestaat niet in SharePoint."
        ],
        correct: 1
    },
    {
        question: "Wat is de functie van 'Status' (Beschikbaarheid) in Teams?",
        options: [
            "Het laat zien of je op kantoor bent of thuis.",
            "Het bepaalt of je berichten kunt ontvangen.",
            "Het geeft aan collega's aan of je beschikbaar, in gesprek, of niet storen bent.",
            "Het is puur decoratief."
        ],
        correct: 2
    }
];

async function main() {
    console.log('Seeding Final Exam...');

    // 1. Find the Microsoft 365 Essentials course
    const course = await prisma.trainingCourse.findFirst({
        where: { slug: 'microsoft-365-essentials' }
    });

    if (!course) {
        console.error('Course not found!');
        return;
    }

    // 2. Create a specific "Final Exam" module if it doesn't exist, or attach to the last module
    // Let's create a dedicated module for the exam to make it stand out
    const examModule = await prisma.trainingModule.upsert({
        where: {
            courseId_order: {
                courseId: course.id,
                order: 999
            }
        },
        update: {},
        create: {
            courseId: course.id,
            title: "Eindtoets & Certificering",
            description: "Test je kennis en behaal je certificaat.",
            order: 999
        }
    });

    console.log('  Exam Module ensured.');

    // 3. Create the Exam Lesson
    const examLesson = await prisma.trainingLesson.create({
        data: {
            moduleId: examModule.id,
            title: "Eindtoets: Microsoft 365 Master",
            content: `Gefeliciteerd! Je bent aangekomen bij het einde van deze cursus.
            
            Voordat je jouw officiële certificaat ontvangt, testen we je kennis met deze eindtoets.
            De toets bestaat uit 5 vragen over de verschillende onderwerpen die we behandeld hebben.
            
            Succes!`,
            order: 1,
            duration: 15,
            quiz: JSON.stringify(FINAL_EXAM_QUESTIONS) // Storing ARRAY of questions now
        }
    });

    console.log(`  Created Exam Lesson: ${examLesson.title}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
