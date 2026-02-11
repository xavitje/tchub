const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const dotenv = require('dotenv');

dotenv.config();

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

const COURSE_TITLE = 'Microsoft 365 Essentials';

const MODULES_CONTENT = [
    {
        title: 'Microsoft Teams: Samenwerken & Communiceren',
        lessons: [
            {
                title: 'Introductie tot Teams',
                quiz: JSON.stringify({
                    question: "Wat is de sneltoets om alle sneltoetsen in Teams te zien?",
                    options: ["Ctrl + C", "Ctrl + .", "Alt + T", "Windows + X"],
                    correct: 1
                }),
                content: `
### Welkom bij Microsoft Teams!

Microsoft Teams is hét centrale punt voor samenwerking binnen Travel Counsellors. Het combineert chat, vergaderingen, notities en bijlagen in één gebruiksvriendelijke interface. In deze les nemen we je mee door de basisfunctionaliteiten.

#### Wat leer je in deze les?
*   **Navigatie**: Hoe vind je je weg in de linker menubalk (Activiteit, Chat, Teams, Agenda, Oproepen, Bestanden).
*   **Teams en Kanalen**: Het verschil tussen een heel Team en de specifieke Kanalen daarbinnen.
*   **Zoeken**: Hoe je snel berichten, personen of bestanden terugvindt met de zoekbalk bovenin.

**Tip:** Gebruik de sneltoets \`Ctrl + .\` om alle beschikbare sneltoetsen in Teams te zien!

#### De Interface Verkend
Aan de linkerkant vind je de **Navigatiebalk**. Hier wissel je tussen verschillende weergaven.
1.  **Activiteit**: Je notificatiecentrum. Hier zie je @mentions, reacties en gemiste oproepen.
2.  **Chat**: Voor 1-op-1 gesprekken of groepschats.
3.  **Teams**: Waar het echte werk gebeurt. Elk team heeft kanalen (zoals 'Algemeen', 'Marketing', 'IT').

Neem even de tijd om rond te klikken en vertrouwd te raken met de indeling.
`
            },
            {
                title: 'Effectief Chatten en Bestanden Delen',
                quiz: JSON.stringify({
                    question: "Waar vind je een bestand terug nadat je het in een chat hebt gedeeld?",
                    options: ["Alleen in je mail", "In het tabblad 'Bestanden' bovenaan de chat", "Op je bureaublad", "In de Prullenbak"],
                    correct: 1
                }),
                content: `
### Chatten als een Pro

Chatten in Teams is meer dan alleen tekst typen. Je kunt je berichten opmaken, bestanden delen en direct samenwerken.

#### Berichten Opmaken
Klik op het icoontje met de **"A" en een potlood** onder het typevak om de uitgebreide teksteditor te openen. Hier kun je:
*   Tekst vetgedrukt of cursief maken.
*   Lijsten met opsommingstekens toevoegen.
*   Tekst markeren als "Belangrijk" zodat het opvalt.

#### Bestanden Delen
Je hoeft nooit meer bestanden te mailen naar collega's!
*   **Sleep en zet neer**: Sleep een bestand direct in het chatvenster.
*   **Gebruik de paperclip**: Klik op het paperclip-icoon om te bladeren op je computer of OneDrive.

Zodra een bestand gedeeld is, staat het in het tabblad **Bestanden** bovenaan de chat. Iedereen in de chat kan het bestand nu tegelijkertijd openen en bewerken. Geen versies zoals "Final_v2_EchtDefinitief.docx" meer!
`
            },
            {
                title: 'Vergaderen als een Pro',
                quiz: JSON.stringify({
                    question: "Wat kun je doen als je iets wilt zeggen zonder de spreker te onderbreken?",
                    options: ["Hard roepen", "De Hand opsteken functie gebruiken", "Je scherm delen", "De vergadering verlaten"],
                    correct: 1
                }),
                content: `
### Online Vergaderingen

Teams vergaderingen zijn essentieel voor ons werk. Of het nu een snelle 1-op-1 catch-up is of een grote presentatie.

#### Een Vergadering Starten
Je kunt op twee manieren vergaderen:
1.  **Nu vergaderen**: Klik in een kanaal of chat op de camera-knop rechtsboven om direct een gesprek te starten.
2.  **Gepland**: Ga naar je **Agenda** in Teams en klik op "+ Nieuwe vergadering". Nodig deelnemers uit en kies een tijdstip.

#### Tien Tips voor Betere Calls
*   **Mute jezelf** als je niet praat om achtergrondgeluid te voorkomen.
*   **Vervaag je achtergrond** of kies een leuke afbeelding als je vanuit huis werkt.
*   **Gebruik de chat** tijdens de vergadering om vragen te stellen zonder de spreker te onderbreken.
*   **Steek je hand op**: Gebruik de "Hand opsteken" functie als je iets wilt zeggen.
*   **Deel je scherm**: Laat zien waar je aan werkt. Je kunt kiezen om je hele scherm of slechts één venster te delen.

Oefening baart kunst! Plan een testvergadering met een collega om deze functies uit te proberen.
`
            }
        ]
    },
    {
        title: 'Microsoft Word: Documenten van de Toekomst',
        lessons: [
            {
                title: 'Documenten Opzetten en Stylen',
                quiz: JSON.stringify({
                    question: "Waarom zou je Stijlen (Styles) gebruiken in Word?",
                    options: ["Het is verplicht door Microsoft", "Voor consistentie en automatische inhoudsopgaven", "Om de tekst onleesbaar te maken", "Het maakt bestanden kleiner"],
                    correct: 1
                }),
                content: `
### Professionele Documenten
Een goed document is niet alleen inhoudelijk sterk, maar ziet er ook verzorgd uit. Word biedt krachtige tools om dit consistent te doen.

#### Gebruik Stijlen (Styles)
Stop met het handmatig vetgedrukt maken van koppen en het groter maken van het lettertype. Gebruik het menu **Stijlen** in het lint (Start > Stijlen).
*   Gebruik **Kop 1** voor je hoofdtitel.
*   Gebruik **Kop 2** en **Kop 3** voor subtitels.
*   Gebruik **Standaard** voor je broodtekst.

**Waarom?**
1.  **Consistentie**: Je hele document heeft dezelfde uitstraling.
2.  **Inhoudsopgave**: Word kan automatisch een inhoudsopgave genereren op basis van je koppen (Verwijzingen > Inhoudsopgave).
3.  **Navigatie**: Lezers (en jijzelf) kunnen via het navigatiedeelvenster (Beeld > Navigatievenster) snel door het document springen.

Investeer 5 minuten in het leren van stijlen, en bespaar uren prutsen met opmaak in de toekomst!
`
            },
            {
                title: 'Samenwerken aan Documenten',
                quiz: JSON.stringify({
                    question: "Wat zie je als een collega in hetzelfde document werkt?",
                    options: ["Een foutmelding", "Een gekleurd vlaggetje met hun naam", "Het document sluit af", "Niets, het is onzichtbaar"],
                    correct: 1
                }),
                content: `
### Co-Authoring: Tegelijk Werken

Het mailen van Word-documenten heen en weer is verleden tijd. In Microsoft 365 kun je met meerdere mensen *tegelijkertijd* in hetzelfde document werken.

#### Hoe werkt het?
1.  Sla je document op in **OneDrive** of **SharePoint** (niet op je C: schijf!).
2.  Klik op de knop **Delen** rechtsboven.
3.  Stuur de link naar je collega.

Zodra je collega het document opent, zie je een gekleurd vlaggetje in de tekst met hun naam. Je ziet letterlijk wat zij typen, terwijl zij typen!

#### Opmerkingen en Revisies
*   **Opmerkingen**: Selecteer tekst en klik op **Invoegen > Nieuwe opmerking** om feedback te geven of vragen te stellen. Je kunt collega's @mentionen om hun aandacht te trekken.
*   **Wijzigingen bijhouden**: Ga naar het tabblad **Controleren** en zet **Wijzigingen bijhouden** aan. Elke aanpassing die jij of je collega doet, wordt gemarkeerd. Aan het eind kun je alle wijzigingen accepteren of weigeren.
`
            }
        ]
    },
    {
        title: 'Microsoft Excel: Data Analyse Basics',
        lessons: [
            {
                title: 'Basis Formules en Functies',
                quiz: JSON.stringify({
                    question: "Waarmee begint elke formule in Excel?",
                    options: ["Met een punt", "Met DE", "Met een = teken", "Met een getal"],
                    correct: 2
                }),
                content: `
### Excel: Je Rekenvriend

Excel kan intimiderend lijken, maar met een paar basisfuncties kom je al heel ver.

#### De Grote Vier
1.  **=SOM(A1:A10)**: Telt alle getallen in de cellen A1 tot en met A10 bij elkaar op.
2.  **=GEMIDDELDE(B1:B20)**: Berekent het gemiddelde van de reeks.
3.  **=AANTAL(C1:C100)**: Telt hoeveel cellen in de reeks een getal bevatten.
4.  **=ALS(A1>100; "Groot"; "Klein")**: Een logische test. Als A1 groter is dan 100, toont de cel "Groot", anders "Klein".

#### Tips voor Formules
*   Begin *altijd* met een **=** teken.
*   Gebruik de **Functie invoegen (fx)** knop naast de formulebalk als je niet precies weet hoe een formule werkt. Excel helpt je dan stap voor stap.
*   **Dubbelklik** op het vierkantje rechtsonder in de cel (de vulgreep) om een formule automatisch naar beneden te kopiëren voor de hele kolom.
`
            },
            {
                title: 'Draaitabellen (Pivot Tables) Introductie',
                quiz: JSON.stringify({
                    question: "Wat is het grootste voordeel van een Draaitabel?",
                    options: ["Het maakt data groen", "Je kunt razendsnel data samenvatten en analyseren", "Het wist je data", "Het werkt alleen in Word"],
                    correct: 1
                }),
                content: `
### Draaitabellen: Toveren met Data

Heb je een enorme lijst met boekingen en wil je weten wat de totale omzet per bestemming is? Gebruik een draaitabel!

#### In 3 Stappen
1.  Selecteer je hele tabel (inclusief koppen!).
2.  Ga naar **Invoegen > Draaitabel**.
3.  Er opent een nieuw werkblad. Sleep nu velden naar de juiste vakken:
    *   Sleep "Bestemming" naar **Rijen**.
    *   Sleep "Omzet" naar **Waarden**.

Boem! Je hebt direct een overzicht van de totale omzet per bestemming. Geen ingewikkelde formules nodig.

#### Experimenteer!
Het mooie van draaitabellen is dat je niets kapot kunt maken. Sleep velden heen en weer om nieuwe inzichten te krijgen. Wil je de omzet per maand zien? Sleep "Datum" ook naar Rijen. Wil je filteren op verkoper? Sleep "Verkoper" naar **Filters**.
`
            }
        ]
    },
    {
        title: 'SharePoint: Kennis beheren',
        lessons: [
            {
                title: 'Document Bibliotheken Beheren',
                quiz: JSON.stringify({
                    question: "Wat is een 'Document Bibliotheek' in SharePoint?",
                    options: ["Een plek om boeken te lenen", "Een map met bestanden", "Een virusscanner", "Een soort vergadering"],
                    correct: 1
                }),
                content: `
### SharePoint vs. OneDrive

*   **OneDrive** is voor jou. Het is je persoonlijke werkruimte. Concepten, privénotities, dingen waar alleen jij aan werkt.
*   **SharePoint** is voor het team/bedrijf. Hier staan de definitieve bestanden, polisvoorwaarden, marketingmateriaal, etc.

#### Bibliotheken
In SharePoint noemen we een map met bestanden een **Document Bibliotheek**.
*   **Versiebeheer**: SharePoint houdt automatisch versies bij. Heb je per ongeluk iets verwijderd of overschreven? Klik op de drie puntjes achter het document -> Versiegeschiedenis en zet een oude versie terug.
*   **Co-Authoring**: Net als in OneDrive kun je ook hier met meerdere mensen tegelijk in werken.

Tip: Probeer **niet te veel mappen in mappen in mappen** te maken. Gebruik liever "Metadata" (extra kolommen) om lables aan bestanden te hangen. Zo kun je makkelijker filteren en sorteren.
`
            },
            {
                title: 'Sneltoetsen en Zoeken',
                quiz: JSON.stringify({
                    question: "Waar zoekt SharePoint in?",
                    options: ["Alleen bestandsnamen", "Alleen in de Prullenbak", "In bestandsnamen én de inhoud van documenten", "Alleen in afbeeldingen"],
                    correct: 2
                }),
                content: `
### Zoeken als een Detective

SharePoint heeft een enorm krachtige zoekfunctie. Bovenin elke pagina vind je de zoekbalk.
*   Het zoekt niet alleen in bestandsnamen, maar ook **in de inhoud** van Word, Excel, PowerPoint en zelfs PDF bestanden!
*   Je kunt filteren op datum ("Afgelopen week") of bestandsType ("Alleen PowerPoint").

#### Synchroniseren
Wil je SharePoint bestanden gewoon in je Windows Verkenner zien, net als vroeger met de G: schijf?
1.  Ga naar de Document Bibliotheek in je browser.
2.  Klik op de knop **Synchroniseren** in de werkbalk.
3.  OneDrive opent en maakt een koppeling op je computer.

Nu kun je bestanden openen, bewerken en opslaan direct vanuit de Verkenner. Wijzigingen worden automatisch geüpload naar SharePoint zodra je online bent.
`
            }
        ]
    }
];

async function main() {
    console.log('Seeding Comprehensive Microsoft 365 Training Content...');

    // 1. Find the Course
    const course = await prisma.trainingCourse.findFirst({
        where: { title: { contains: 'Microsoft 365' } }
    });

    if (!course) {
        console.error('Course not found! Please run the initial seed script first.');
        return;
    }

    console.log(`Updating Course: ${course.title} (${course.id})`);

    // 2. Iterate and Update
    for (const modData of MODULES_CONTENT) {
        const module = await prisma.trainingModule.findFirst({
            where: {
                courseId: course.id,
                title: { contains: modData.title.split(':')[0] } // Match loose title
            }
        });

        if (!module) {
            console.log(`Module not found: ${modData.title}`);
            continue;
        }

        console.log(`  Updating Module: ${module.title}`);

        for (const lessonData of modData.lessons) {
            const lesson = await prisma.trainingLesson.findFirst({
                where: {
                    moduleId: module.id,
                    title: lessonData.title
                }
            });

            if (lesson) {
                console.log(`    Updating Lesson: ${lesson.title}`);
                await prisma.trainingLesson.update({
                    where: { id: lesson.id },
                    data: {
                        content: lessonData.content.trim(),
                        quiz: lessonData.quiz
                    }
                });
            } else {
                console.log(`    Lesson not found: ${lessonData.title}`);
            }
        }
    }

    console.log('Content update complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
