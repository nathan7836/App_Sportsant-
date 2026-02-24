# 🗺️ OÙ MODIFIER LE CODE ? - GUIDE VISUEL

## 📂 STRUCTURE DE VOTRE PROJET

Voici où se trouvent vos fichiers selon votre framework :

### React / React Native
```
mon-projet/
├── package.json
├── src/
│   ├── App.tsx                    ← 🎯 MODIFIEZ ICI !
│   ├── index.tsx
│   ├── components/
│   ├── pages/
│   └── services/
│       └── NotificationService.ts  ← Ou créez ce fichier
└── ios/
    └── App/
        └── App/
            └── AppDelegate.swift  ← ✅ Déjà corrigé
```

### Vue.js
```
mon-projet/
├── package.json
├── src/
│   ├── main.ts                    ← 🎯 MODIFIEZ ICI !
│   ├── App.vue                    ← Ou ici
│   ├── components/
│   ├── views/
│   └── services/
│       └── NotificationService.ts  ← Ou créez ce fichier
└── ios/
    └── App/
        └── App/
            └── AppDelegate.swift  ← ✅ Déjà corrigé
```

### Angular
```
mon-projet/
├── package.json
├── src/
│   ├── app/
│   │   ├── app.component.ts       ← 🎯 MODIFIEZ ICI !
│   │   ├── app.module.ts
│   │   └── services/
│   │       └── notification.service.ts  ← Ou créez ce fichier
│   └── main.ts
└── ios/
    └── App/
        └── App/
            └── AppDelegate.swift  ← ✅ Déjà corrigé
```

### Ionic
```
mon-projet/
├── package.json
├── src/
│   ├── app/
│   │   └── app.component.ts       ← 🎯 MODIFIEZ ICI (Angular)
│   ├── App.tsx                    ← 🎯 MODIFIEZ ICI (React)
│   ├── App.vue                    ← 🎯 MODIFIEZ ICI (Vue)
│   └── services/
│       └── NotificationService.ts  ← Ou créez ce fichier
└── ios/
    └── App/
        └── App/
            └── AppDelegate.swift  ← ✅ Déjà corrigé
```

---

## 🔄 FLUX COMPLET : Du code Swift au code JavaScript

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX DE NOTIFICATION                         │
└─────────────────────────────────────────────────────────────────┘

1️⃣ CÔTÉ SWIFT (iOS) - ✅ Déjà corrigé
   ┌──────────────────────────────────────┐
   │  AppDelegate.swift                   │
   │  • Firebase configuré                │
   │  • MessagingDelegate ajouté          │
   │  • Token FCM reçu                    │
   └──────────────────────────────────────┘
                   ↓
   ┌──────────────────────────────────────┐
   │  NotificationRouter (Capacitor)      │
   │  • Gère les notifications            │
   │  • Transmet à JavaScript             │
   └──────────────────────────────────────┘
                   ↓
2️⃣ CÔTÉ JAVASCRIPT - 🎯 À MODIFIER
   ┌──────────────────────────────────────┐
   │  Votre code JavaScript/TypeScript    │
   │                                      │
   │  src/App.tsx (React)                 │
   │  src/main.ts (Vue)                   │
   │  app.component.ts (Angular)          │
   │                                      │
   │  import { PushNotifications }        │
   │  from '@capacitor/push-notifications'│
   │                                      │
   │  PushNotifications.addListener(...)  │
   └──────────────────────────────────────┘
                  ↓
   ┌──────────────────────────────────────┐
   │  Votre Backend API                   │
   │  • Reçoit le token                   │
   │  • Envoie les notifications          │
   └──────────────────────────────────────┘
```

---

## 📍 TABLEAU RÉCAPITULATIF

| Framework | Fichier à modifier | Emplacement |
|-----------|-------------------|-------------|
| **React** | `App.tsx` | `src/App.tsx` |
| **Vue 3** | `main.ts` ou `App.vue` | `src/main.ts` ou `src/App.vue` |
| **Angular** | `app.component.ts` | `src/app/app.component.ts` |
| **Ionic React** | `App.tsx` | `src/App.tsx` |
| **Ionic Vue** | `App.vue` | `src/App.vue` |
| **Ionic Angular** | `app.component.ts` | `src/app/app.component.ts` |
| **Vanilla JS** | `index.js` ou `main.js` | `src/index.js` |

---

## 🎯 CODE MINIMAL À AJOUTER

Dans **n'importe quel fichier ci-dessus**, ajoutez ceci **une seule fois** :

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// Au démarrage de l'app (useEffect, onMounted, ngOnInit, etc.)
async function initNotifications() {
  // 1. Demander la permission
  const perm = await PushNotifications.requestPermissions();
  if (perm.receive === 'granted') {
    // 2. S'enregistrer
    PushNotifications.register();
  }
  
  // 3. Écouter le token
  PushNotifications.addListener('registration', token => {
    console.log('Token:', token.value);
  });
  
  // 4. Écouter les notifications
  PushNotifications.addListener('pushNotificationReceived', notif => {
    console.log('Notification:', notif);
  });
  
  // 5. Écouter les actions
  PushNotifications.addListener('pushNotificationActionPerformed', action => {
    console.log('Action:', action);
  });
}

// Appeler au démarrage
initNotifications();
```

---

## 🔍 COMMENT TROUVER VOTRE FICHIER PRINCIPAL ?

### Méthode 1 : Chercher dans package.json

Ouvrez `package.json` et regardez :

```json
{
  "main": "src/index.tsx",     ← C'est probablement ici
  "scripts": {
    "start": "react-scripts start"  ← Framework = React
  }
}
```

### Méthode 2 : Regarder la structure

```bash
# Dans le terminal
ls src/

# Si vous voyez :
# App.tsx → React
# main.ts → Vue
# app.component.ts → Angular
```

### Méthode 3 : Ouvrir dans VS Code

1. Ouvrez VS Code
2. Regardez l'explorateur de fichiers à gauche
3. Ouvrez le dossier `src/`
4. Cherchez un fichier qui contient "App" dans son nom

---

## 📝 EXEMPLES CONCRETS PAR FRAMEWORK

### React

**Fichier : `src/App.tsx`**

```typescript
import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

function App() {
  useEffect(() => {
    // ✅ AJOUTEZ CE CODE ICI
    PushNotifications.requestPermissions().then(perm => {
      if (perm.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', token => {
      console.log('Token:', token.value);
    });
  }, []);

  return (
    <div className="App">
      <h1>Mon App</h1>
    </div>
  );
}

export default App;
```

### Vue

**Fichier : `src/main.ts`**

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { PushNotifications } from '@capacitor/push-notifications';

// ✅ AJOUTEZ CE CODE ICI
PushNotifications.requestPermissions().then(perm => {
  if (perm.receive === 'granted') {
    PushNotifications.register();
  }
});

PushNotifications.addListener('registration', token => {
  console.log('Token:', token.value);
});

const app = createApp(App);
app.mount('#app');
```

### Angular

**Fichier : `src/app/app.component.ts`**

```typescript
import { Component, OnInit } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  ngOnInit() {
    // ✅ AJOUTEZ CE CODE ICI
    PushNotifications.requestPermissions().then(perm => {
      if (perm.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', token => {
      console.log('Token:', token.value);
    });
  }
}
```

---

## 🚀 ÉTAPES COMPLÈTES

### 1. Installer le plugin (une seule fois)

```bash
npm install @capacitor/push-notifications
npx cap sync
```

### 2. Ouvrir votre fichier principal

Selon votre framework :
- React → `src/App.tsx`
- Vue → `src/main.ts` ou `src/App.vue`
- Angular → `src/app/app.component.ts`

### 3. Ajouter l'import en haut du fichier

```typescript
import { PushNotifications } from '@capacitor/push-notifications';
```

### 4. Copier le code d'initialisation

Voir **CODE-COPIER-COLLER.md** pour le code exact selon votre framework.

### 5. Tester sur appareil

```bash
npx cap open ios
# Puis Run dans Xcode
```

### 6. Vérifier les logs

Vous devriez voir dans la console :
```
Token: eL3X4mpl3T0k3n...
```

---

## 🎓 TUTORIEL PAS À PAS

### Option A : React

1. Ouvrez `src/App.tsx`
2. Ajoutez l'import en haut :
   ```typescript
   import { PushNotifications } from '@capacitor/push-notifications';
   ```
3. Dans le `useEffect`, ajoutez :
   ```typescript
   useEffect(() => {
     // Code des notifications ici
   }, []);
   ```
4. Copiez le code de **CODE-COPIER-COLLER.md** section React
5. Sauvegardez
6. Testez : `npm start` puis `npx cap open ios`

### Option B : Vue

1. Ouvrez `src/main.ts`
2. Ajoutez l'import en haut :
   ```typescript
   import { PushNotifications } from '@capacitor/push-notifications';
   ```
3. Ajoutez le code d'initialisation **avant** `app.mount('#app')`
4. Copiez le code de **CODE-COPIER-COLLER.md** section Vue
5. Sauvegardez
6. Testez : `npm run dev` puis `npx cap open ios`

### Option C : Angular

1. Ouvrez `src/app/app.component.ts`
2. Ajoutez l'import en haut :
   ```typescript
   import { PushNotifications } from '@capacitor/push-notifications';
   ```
3. Dans `ngOnInit()`, ajoutez le code d'initialisation
4. Copiez le code de **CODE-COPIER-COLLER.md** section Angular
5. Sauvegardez
6. Testez : `npm start` puis `npx cap open ios`

---

## ✅ CHECKLIST FINALE

- [ ] J'ai identifié mon framework (React, Vue, Angular, etc.)
- [ ] J'ai trouvé le fichier principal à modifier
- [ ] J'ai installé le plugin : `npm install @capacitor/push-notifications`
- [ ] J'ai ajouté l'import en haut du fichier
- [ ] J'ai copié le code d'initialisation
- [ ] J'ai exécuté `npx cap sync`
- [ ] J'ai testé sur un appareil physique
- [ ] Le token s'affiche dans les logs ✅

---

## 🆘 BESOIN D'AIDE ?

### "Je ne trouve pas mon fichier principal"

Exécutez cette commande dans le terminal :

```bash
# Chercher les fichiers principaux
find src -name "App.tsx" -o -name "App.vue" -o -name "main.ts" -o -name "app.component.ts"
```

### "Je ne sais pas quel framework j'utilise"

Regardez `package.json`, section `dependencies` :

```json
{
  "dependencies": {
    "react": "^18.0.0",        ← React
    "vue": "^3.0.0",           ← Vue
    "@angular/core": "^17.0.0" ← Angular
  }
}
```

### "Le code ne compile pas"

Vérifiez que vous avez bien :
1. Installé le plugin : `npm install @capacitor/push-notifications`
2. Synchronisé : `npx cap sync`
3. Ajouté l'import en haut du fichier

---

## 📚 RESSOURCES

| Document | Description |
|----------|-------------|
| **CODE-COPIER-COLLER.md** | Code prêt à copier pour chaque framework |
| **GUIDE-CODE-JAVASCRIPT.md** | Guide détaillé avec explications |
| **NotificationService-Example.ts** | Service complet à réutiliser |
| **README-NOTIFICATIONS.md** | Guide complet de A à Z |

---

## 🎉 RÉSUMÉ

**Où modifier ?** → Fichier principal de votre app (App.tsx, main.ts, etc.)  
**Quoi ajouter ?** → Import + code d'initialisation (5 lignes)  
**Comment tester ?** → Sur appareil physique avec `npx cap open ios`  
**Résultat attendu ?** → Token affiché dans les logs + notifications fonctionnelles ✅

**Vous êtes prêt ! 🚀**
