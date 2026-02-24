# 🔧 GUIDE : Où et comment modifier le code JavaScript/TypeScript

Ce guide vous montre **exactement** où placer le code pour les notifications Firebase dans votre application Capacitor.

---

## 📍 OÙ MODIFIER LE CODE ?

### Option 1 : React / React Native

#### Fichier : `src/App.tsx` ou `src/App.jsx`

```typescript
import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

function App() {
  useEffect(() => {
    // 🔔 INITIALISER LES NOTIFICATIONS AU DÉMARRAGE
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // 1. Vérifier les permissions
      const permStatus = await PushNotifications.checkPermissions();
      console.log('📱 Statut des permissions:', permStatus);

      // 2. Demander la permission si nécessaire
      if (permStatus.receive === 'prompt') {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== 'granted') {
          console.warn('⚠️ Permission refusée');
          return;
        }
      }

      // 3. S'enregistrer pour les notifications
      await PushNotifications.register();
      console.log('✅ Enregistrement réussi');

      // 4. Écouter le token
      PushNotifications.addListener('registration', (token) => {
        console.log('📱 Token reçu:', token.value);
        // TODO: Envoyer ce token à votre backend
        sendTokenToBackend(token.value);
      });

      // 5. Écouter les erreurs
      PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ Erreur:', error);
      });

      // 6. Écouter les notifications (app ouverte)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📩 Notification reçue:', notification);
        // Vous pouvez afficher une alerte, un toast, etc.
        alert(`${notification.title}: ${notification.body}`);
      });

      // 7. Écouter les actions (utilisateur tape sur notification)
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('👆 Notification tapée:', action);
        const data = action.notification.data;
        
        // Router vers la bonne page selon les données
        if (data.route) {
          // Si vous utilisez React Router :
          // navigate(data.route);
          console.log('📍 Naviguer vers:', data.route);
        }
      });

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
    }
  };

  const sendTokenToBackend = async (token: string) => {
    try {
      // Remplacez par votre endpoint API
      await fetch('https://votre-api.com/api/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          platform: 'ios',
          userId: 'USER_ID' // Votre ID utilisateur
        })
      });
      console.log('✅ Token envoyé au backend');
    } catch (error) {
      console.error('❌ Erreur envoi token:', error);
    }
  };

  return (
    <div className="App">
      <h1>Mon Application</h1>
      {/* Votre contenu */}
    </div>
  );
}

export default App;
```

---

### Option 2 : Vue.js

#### Fichier : `src/main.ts` ou `src/main.js`

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { PushNotifications } from '@capacitor/push-notifications';

const app = createApp(App);

// 🔔 INITIALISER LES NOTIFICATIONS
const initializePushNotifications = async () => {
  try {
    // 1. Vérifier les permissions
    const permStatus = await PushNotifications.checkPermissions();
    console.log('📱 Statut:', permStatus);

    // 2. Demander la permission
    if (permStatus.receive === 'prompt') {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        console.warn('⚠️ Permission refusée');
        return;
      }
    }

    // 3. S'enregistrer
    await PushNotifications.register();

    // 4. Écouter le token
    PushNotifications.addListener('registration', (token) => {
      console.log('📱 Token:', token.value);
      // TODO: Envoyer au backend
    });

    // 5. Écouter les notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📩 Notification:', notification);
    });

    // 6. Écouter les actions
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('👆 Action:', action);
      // Router si nécessaire
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Initialiser avant de monter l'app
initializePushNotifications();

app.mount('#app');
```

#### Ou dans : `src/App.vue`

```vue
<template>
  <div id="app">
    <h1>Mon Application</h1>
    <!-- Votre contenu -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { PushNotifications } from '@capacitor/push-notifications';

onMounted(() => {
  initializePushNotifications();
});

const initializePushNotifications = async () => {
  // ... même code que ci-dessus
};
</script>
```

---

### Option 3 : Angular

#### Fichier : `src/app/app.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'mon-app';

  ngOnInit() {
    // 🔔 INITIALISER LES NOTIFICATIONS
    this.initializePushNotifications();
  }

  async initializePushNotifications() {
    try {
      // 1. Vérifier les permissions
      const permStatus = await PushNotifications.checkPermissions();
      console.log('📱 Statut:', permStatus);

      // 2. Demander la permission
      if (permStatus.receive === 'prompt') {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== 'granted') {
          console.warn('⚠️ Permission refusée');
          return;
        }
      }

      // 3. S'enregistrer
      await PushNotifications.register();
      console.log('✅ Enregistrement réussi');

      // 4. Écouter le token
      PushNotifications.addListener('registration', (token) => {
        console.log('📱 Token:', token.value);
        this.sendTokenToBackend(token.value);
      });

      // 5. Écouter les erreurs
      PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ Erreur:', error);
      });

      // 6. Écouter les notifications (app ouverte)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📩 Notification:', notification);
      });

      // 7. Écouter les actions
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('👆 Action:', action);
        
        const data = action.notification.data;
        if (data.route) {
          // Utiliser Angular Router
          // this.router.navigate([data.route]);
        }
      });

    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  }

  async sendTokenToBackend(token: string) {
    // Envoyer à votre API
    console.log('Token à envoyer:', token);
  }
}
```

---

### Option 4 : Ionic (React, Vue, ou Angular)

#### Si vous utilisez Ionic, le code est le même mais peut être placé dans :

**Ionic React** : `src/App.tsx`  
**Ionic Vue** : `src/App.vue`  
**Ionic Angular** : `src/app/app.component.ts`

Le code reste identique aux exemples ci-dessus.

---

### Option 5 : Vanilla JavaScript

#### Fichier : `src/index.js` ou `src/main.js`

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// 🔔 INITIALISER AU CHARGEMENT DE LA PAGE
document.addEventListener('DOMContentLoaded', () => {
  initializePushNotifications();
});

async function initializePushNotifications() {
  try {
    // 1. Vérifier les permissions
    const permStatus = await PushNotifications.checkPermissions();
    console.log('📱 Statut:', permStatus);

    // 2. Demander la permission
    if (permStatus.receive === 'prompt') {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        console.warn('⚠️ Permission refusée');
        return;
      }
    }

    // 3. S'enregistrer
    await PushNotifications.register();

    // 4. Écouter le token
    PushNotifications.addListener('registration', (token) => {
      console.log('📱 Token:', token.value);
      sendTokenToBackend(token.value);
    });

    // 5. Écouter les notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📩 Notification:', notification);
      showCustomNotification(notification);
    });

    // 6. Écouter les actions
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('👆 Action:', action);
      handleNotificationAction(action);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

function sendTokenToBackend(token) {
  fetch('https://votre-api.com/api/register-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform: 'ios' })
  })
  .then(response => response.json())
  .then(data => console.log('✅ Token envoyé', data))
  .catch(error => console.error('❌ Erreur:', error));
}

function showCustomNotification(notification) {
  // Afficher une notification personnalisée dans votre UI
  const notifDiv = document.createElement('div');
  notifDiv.className = 'custom-notification';
  notifDiv.innerHTML = `
    <h3>${notification.title}</h3>
    <p>${notification.body}</p>
  `;
  document.body.appendChild(notifDiv);
  
  // Supprimer après 5 secondes
  setTimeout(() => notifDiv.remove(), 5000);
}

function handleNotificationAction(action) {
  const data = action.notification.data;
  
  if (data.route) {
    // Naviguer vers la page
    window.location.href = data.route;
  }
}
```

---

## 📦 INSTALLATION DU PLUGIN

Avant de modifier le code, assurez-vous d'avoir installé le plugin :

```bash
# 1. Installer le plugin
npm install @capacitor/push-notifications

# 2. Synchroniser avec les projets natifs
npx cap sync
```

---

## 🎯 MÉTHODE RECOMMANDÉE : Créer un service

### Fichier : `src/services/NotificationService.ts`

Créez un nouveau fichier pour gérer toutes les notifications :

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

class NotificationService {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      console.log('Notifications déjà initialisées');
      return;
    }

    try {
      // Vérifier les permissions
      const permStatus = await PushNotifications.checkPermissions();

      // Demander si nécessaire
      if (permStatus.receive === 'prompt') {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== 'granted') {
          console.warn('Permission refusée');
          return;
        }
      }

      // S'enregistrer
      await PushNotifications.register();

      // Configurer les listeners
      this.setupListeners();

      this.initialized = true;
      console.log('✅ Notifications initialisées');

    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
    }
  }

  private setupListeners() {
    // Token reçu
    PushNotifications.addListener('registration', (token) => {
      console.log('📱 Token:', token.value);
      this.onTokenReceived(token.value);
    });

    // Erreur
    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Erreur:', error);
    });

    // Notification reçue (app ouverte)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📩 Notification:', notification);
      this.onNotificationReceived(notification);
    });

    // Action sur notification
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('👆 Action:', action);
      this.onNotificationAction(action);
    });
  }

  private async onTokenReceived(token: string) {
    // Envoyer au backend
    try {
      await fetch('https://votre-api.com/api/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'ios' })
      });
      console.log('✅ Token envoyé au backend');
    } catch (error) {
      console.error('❌ Erreur envoi token:', error);
    }
  }

  private onNotificationReceived(notification: any) {
    // Gérer la notification (afficher un toast, mettre à jour l'UI, etc.)
    console.log('Nouvelle notification:', notification.title);
  }

  private onNotificationAction(action: any) {
    // Gérer l'action (router vers une page, etc.)
    const data = action.notification.data;
    
    if (data.route) {
      console.log('Router vers:', data.route);
      // Implémenter le routing selon votre framework
    }
  }

  async getDeliveredNotifications() {
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  }

  async removeAllNotifications() {
    await PushNotifications.removeAllDeliveredNotifications();
  }
}

export default new NotificationService();
```

### Puis l'utiliser dans votre App :

```typescript
// Dans App.tsx / App.vue / app.component.ts
import NotificationService from './services/NotificationService';

// Au démarrage
NotificationService.initialize();
```

---

## 🗂️ STRUCTURE DE PROJET RECOMMANDÉE

```
src/
├── App.tsx                          # Point d'entrée principal
├── services/
│   └── NotificationService.ts       # ✅ Service des notifications
├── components/
│   └── NotificationBadge.tsx        # Badge de notification
├── pages/
│   ├── Home.tsx
│   └── Orders.tsx                   # Page des commandes
└── utils/
    └── notificationHelpers.ts       # Fonctions utilitaires
```

---

## ✅ CHECKLIST

- [ ] Plugin `@capacitor/push-notifications` installé
- [ ] Code d'initialisation ajouté dans le fichier principal
- [ ] Listeners configurés pour les 4 événements
- [ ] Token envoyé au backend
- [ ] Routing configuré pour les actions
- [ ] Testé sur un appareil physique

---

## 🧪 TESTER VOTRE CODE

### 1. Vérifiez la console du navigateur (lors du développement)
```javascript
console.log('Token:', token.value); // Devrait s'afficher
```

### 2. Vérifiez les logs Xcode (sur appareil)
- Ouvrez Xcode
- Window → Devices and Simulators
- Sélectionnez votre appareil
- Cliquez sur "Open Console"
- Cherchez "Token" ou "Notification"

### 3. Envoyez une notification de test
- Firebase Console → Cloud Messaging
- "Envoyer un message de test"
- Utilisez le token affiché dans les logs

---

## 🆘 PROBLÈMES COURANTS

### "PushNotifications is not defined"
```bash
# Solution : Installer le plugin
npm install @capacitor/push-notifications
npx cap sync
```

### "Registration failed"
- Vérifiez que vous testez sur un appareil physique
- Vérifiez que les capabilities sont activées dans Xcode
- Vérifiez que GoogleService-Info.plist est présent

### Le token n'apparaît pas
- Vérifiez les logs Xcode
- Vérifiez que Firebase est configuré dans AppDelegate
- Relancez l'application

---

## 📞 SUPPORT

Consultez aussi :
- **NotificationService-Example.ts** - Exemple complet
- **README-NOTIFICATIONS.md** - Guide complet
- **DIAGNOSTIC-COMPLET.md** - Dépannage

---

**Résumé : Ajoutez le code d'initialisation dans votre fichier principal (App.tsx, main.ts, etc.) au démarrage de l'application !**
