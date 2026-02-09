# HubTC - Travel Counsellors Social Intranet

Een modern, op maat gemaakt sociaal intranet platform voor Travel Counsellors met Reddit-stijl communicatie, SharePoint integratie en Azure AD authenticatie.

## 🚀 Quick Start

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

## 📋 Features

### ✅ Geïmplementeerd
- **Navigatie**: 7 hoofd-tabs + TC Hubs mega-menu met 17 hubs
- **Homepage**: Hero section, stats, posts feed, sidebar met events/polls
- **Design System**: Custom Tailwind configuratie met bedrijfskleuren
- **Database Schema**: Complete Prisma schema met 13 modellen
- **Responsive Design**: Mobile-first approach

### 🚧 In Ontwikkeling
- Azure AD SSO authenticatie
- Post creation (posts, polls, events)
- Comment systeem met threading
- Favorites functionaliteit
- Global search
- Real-time notifications

## 🎨 Design Specificaties

**Kleurenpalet:**
- Primary (Bordeaux): `#530E2F`
- Light: `#F4F5F7`
- Dark: `#1A1C1E`

**Font:** Inter (Google Fonts)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM (PostgreSQL)
- **Auth**: NextAuth.js met Azure AD
- **Icons**: Lucide React

## 📁 Project Structuur

```
HubTC/
├── app/                    # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── navigation/
│       ├── Navbar.tsx      # Hoofdnavigatie
│       └── TCHubsMenu.tsx  # TC Hubs mega-menu
├── lib/
│   ├── utils.ts            # Utility functies
│   └── constants.ts        # TC Hubs data
├── prisma/
│   └── schema.prisma       # Database schema
└── package.json
```

## 🗄️ Database Schema

**Modellen:**
- User (met Azure AD integratie)
- Post (POST, POLL, EVENT types)
- Poll, PollOption, PollVote
- Event, EventRegistration
- Comment (nested threading)
- Favorite
- Hub (TC Hubs configuratie)
- Notification
- Tag, Attachment

## 🔧 Environment Variables

Kopieer `.env.example` naar `.env.local` en vul de waarden in:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
AZURE_AD_CLIENT_ID="..."
AZURE_AD_CLIENT_SECRET="..."
AZURE_AD_TENANT_ID="..."
```

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build voor productie
npm run start      # Start productie server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## 🎯 Navigatie Structuur

**Hoofd Tabs:**
1. Home
2. Phenix (externe link)
3. Platformstatus
4. Discussies
5. Training
6. Support Portal
7. Ideas Portal

**TC Hubs (Mega-menu met 17 items):**
TCTV, Vimeo, BD Kanaal, TC Catch Up, Crisis Hub, Marketing Hub, Performance Hub, Commercial Hub, Events Hub, IATA Hub, IT Hub, Corporate Hub, TC Care, TC Support, DE&I Hub, Training Hub, Intranet

## 🔐 Authenticatie

Azure AD SSO integratie via NextAuth.js (configuratie gereed, implementatie volgt).

## 📝 Volgende Stappen

1. **Azure AD Setup**: App Registration configureren
2. **Database**: PostgreSQL database opzetten en migraties draaien
3. **Features**: Post creation, comments, polls implementeren
4. **SharePoint**: TC Hubs URLs configureren
5. **Real-time**: Azure SignalR voor notifications

## 📚 Documentatie

Zie [walkthrough.md](file:///.gemini/antigravity/brain/b5ca07c7-12bc-472b-8848-44e3ed4e5104/walkthrough.md) voor een uitgebreide walkthrough van het project.

## 🤝 Contributing

Dit is een intern project voor Travel Counsellors.

## 📄 License

Proprietary - Travel Counsellors
