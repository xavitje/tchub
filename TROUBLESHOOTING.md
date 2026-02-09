# TypeScript Errors Oplossen

De TypeScript errors die je ziet in de IDE zijn **tijdelijk** en normaal na een verse npm installatie.

## Oplossing 1: TypeScript Server Herstarten (Aanbevolen)

In VS Code:
1. Druk op `Ctrl+Shift+P` (of `Cmd+Shift+P` op Mac)
2. Type: `TypeScript: Restart TS Server`
3. Druk op Enter

De errors zouden nu moeten verdwijnen.

## Oplossing 2: VS Code Herladen

Als de errors blijven:
1. Druk op `Ctrl+Shift+P`
2. Type: `Developer: Reload Window`
3. Druk op Enter

## Oplossing 3: Handmatig TypeScript Cache Wissen

```bash
# Verwijder .next folder
Remove-Item -Recurse -Force .next

# Herstart dev server
npm run dev
```

## Verificatie

Alle benodigde packages zijn correct geïnstalleerd:
- ✅ @types/node@20.19.31
- ✅ @types/react@18.3.27
- ✅ @types/react-dom@18.3.7
- ✅ typescript@5.x
- ✅ next@14.2.0

De development server draait zonder problemen op http://localhost:3000

## Waarom gebeurt dit?

Na `npm install` moet de TypeScript language server de nieuwe `node_modules` indexeren. Dit kan 10-30 seconden duren. De errors zijn **alleen in de IDE** - de applicatie werkt perfect.
