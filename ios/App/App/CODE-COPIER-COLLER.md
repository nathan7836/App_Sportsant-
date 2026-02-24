# ⚡ CODE JAVASCRIPT À COPIER-COLLER

## 🎯 VERSION ULTRA-SIMPLE (5 lignes)

Copiez ce code dans **votre fichier principal** (App.tsx, main.ts, index.js, etc.) :

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// Demander la permission et s'enregistrer
PushNotifications.requestPermissions().then(result => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

// Écouter le token
PushNotifications.addListener('registration', token => {
  console.log('📱 Mon token:', token.value);
  // TODO: Envoyer ce token à votre serveur backend
});

// Écouter les notifications
PushNotifications.addListener('pushNotificationReceived', notification => {
  console.log('📩 Notification reçue:', notification);
  alert(`${notification.title}: ${notification.body}`);
});

// Écouter quand l'utilisateur tape sur une notification
PushNotifications.addListener('pushNotificationActionPerformed', action => {
  console.log('👆 Notification tapée:', action);
});
```

**C'est tout ! Maintenant testez sur votre appareil iOS.**

---

## 📱 VERSION REACT (Copier dans App.tsx)

```typescript
import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

function App() {
  useEffect(() => {
    // 🔔 Configuration des notifications
    const setupNotifications = async () => {
      // Demander la permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // S'enregistrer
        PushNotifications.register();
        
        // Écouter le token
        PushNotifications.addListener('registration', token => {
          console.log('Token:', token.value);
          // Envoyer au backend
          fetch('https://votre-api.com/api/save-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token.value })
          });
        });
        
        // Notification reçue
        PushNotifications.addListener('pushNotificationReceived', notif => {
          console.log('Notification:', notif);
        });
        
        // Notification tapée
        PushNotifications.addListener('pushNotificationActionPerformed', action => {
          console.log('Action:', action);
        });
      }
    };
    
    setupNotifications();
  }, []);

  return (
    <div className="App">
      <h1>Mon Application</h1>
      {/* Votre contenu ici */}
    </div>
  );
}

export default App;
```

---

## 🎨 VERSION VUE (Copier dans main.ts ou App.vue)

### Option A : Dans main.ts

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { PushNotifications } from '@capacitor/push-notifications';

// Configuration des notifications
PushNotifications.requestPermissions().then(result => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

PushNotifications.addListener('registration', token => {
  console.log('Token:', token.value);
});

PushNotifications.addListener('pushNotificationReceived', notif => {
  console.log('Notification:', notif);
});

PushNotifications.addListener('pushNotificationActionPerformed', action => {
  console.log('Action:', action);
});

const app = createApp(App);
app.mount('#app');
```

### Option B : Dans App.vue

```vue
<template>
  <div id="app">
    <h1>Mon Application</h1>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { PushNotifications } from '@capacitor/push-notifications';

onMounted(async () => {
  // Demander la permission
  const permission = await PushNotifications.requestPermissions();
  
  if (permission.receive === 'granted') {
    PushNotifications.register();
    
    PushNotifications.addListener('registration', token => {
      console.log('Token:', token.value);
    });
    
    PushNotifications.addListener('pushNotificationReceived', notif => {
      console.log('Notification:', notif);
    });
    
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('Action:', action);
    });
  }
});
</script>
```

---

## 🅰️ VERSION ANGULAR (Copier dans app.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  ngOnInit() {
    this.setupNotifications();
  }

  async setupNotifications() {
    // Demander la permission
    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      // S'enregistrer
      PushNotifications.register();
      
      // Écouter le token
      PushNotifications.addListener('registration', token => {
        console.log('Token:', token.value);
        this.sendTokenToServer(token.value);
      });
      
      // Notification reçue
      PushNotifications.addListener('pushNotificationReceived', notif => {
        console.log('Notification:', notif);
      });
      
      // Notification tapée
      PushNotifications.addListener('pushNotificationActionPerformed', action => {
        console.log('Action:', action);
      });
    }
  }

  sendTokenToServer(token: string) {
    // Envoyer le token à votre API
    console.log('Token à envoyer:', token);
  }
}
```

---

## 🔥 VERSION IONIC (React, Vue ou Angular)

Le code est **exactement le même** que les versions ci-dessus selon votre framework :
- **Ionic React** → Utilisez la version React
- **Ionic Vue** → Utilisez la version Vue  
- **Ionic Angular** → Utilisez la version Angular

---

## 📦 AVANT DE TESTER : Installer le plugin

```bash
npm install @capacitor/push-notifications
npx cap sync
```

---

## 🧪 COMMENT TESTER

### 1. Lancer l'app sur votre iPhone/iPad

```bash
# Ouvrir dans Xcode
npx cap open ios

# Puis dans Xcode :
# - Sélectionnez votre appareil (pas simulateur!)
# - Product → Run (Cmd+R)
```

### 2. Vérifier les logs

Dans la console de votre navigateur ou Xcode, vous devriez voir :

```
📱 Mon token: eL3X4mpl3T0k3n...
```

**Copiez ce token !**

### 3. Envoyer une notification de test

Ouvrez votre terminal et collez ceci (remplacez `VOTRE_TOKEN` et `VOTRE_SERVER_KEY`) :

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=VOTRE_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "VOTRE_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Ceci est un test"
    }
  }'
```

Ou utilisez **Firebase Console** :
1. https://console.firebase.google.com
2. Cloud Messaging → "Envoyer un message de test"
3. Collez le token
4. Cliquez "Tester"

**Vous devriez recevoir la notification ! 🎉**

---

## 🔧 PERSONNALISATION : Envoyer le token à votre backend

Remplacez cette ligne :

```javascript
PushNotifications.addListener('registration', token => {
  console.log('📱 Mon token:', token.value);
  
  // ✅ AJOUTEZ CECI :
  fetch('https://VOTRE-API.com/api/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: token.value,
      platform: 'ios',
      userId: 'USER_ID', // L'ID de votre utilisateur
      deviceId: 'DEVICE_ID' // Optionnel
    })
  })
  .then(response => response.json())
  .then(data => console.log('✅ Token enregistré', data))
  .catch(error => console.error('❌ Erreur', error));
});
```

---

## 🎯 ROUTER VERS UNE PAGE SPÉCIFIQUE

Quand l'utilisateur tape sur la notification, router vers une page :

```javascript
PushNotifications.addListener('pushNotificationActionPerformed', action => {
  const data = action.notification.data;
  
  // Si votre notification contient un champ "route"
  if (data.route) {
    // React Router
    // navigate(data.route);
    
    // Vue Router
    // router.push(data.route);
    
    // Angular Router
    // this.router.navigate([data.route]);
    
    // Vanilla JS
    window.location.href = data.route;
  }
  
  // Exemples de routing selon les données
  if (data.orderId) {
    console.log('Ouvrir la commande:', data.orderId);
    // navigate(`/orders/${data.orderId}`);
  }
  
  if (data.messageId) {
    console.log('Ouvrir le message:', data.messageId);
    // navigate(`/messages/${data.messageId}`);
  }
});
```

---

## 🎨 AFFICHER UNE NOTIFICATION PERSONNALISÉE

Quand l'app est ouverte et qu'une notification arrive :

```javascript
PushNotifications.addListener('pushNotificationReceived', notification => {
  // Option 1 : Alert simple
  alert(`${notification.title}\n${notification.body}`);
  
  // Option 2 : Toast (si vous utilisez une lib de toast)
  // toast.success(notification.body);
  
  // Option 3 : Notification personnalisée dans votre UI
  showCustomNotification(notification);
});

function showCustomNotification(notification) {
  // Créer un élément HTML
  const notifDiv = document.createElement('div');
  notifDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
  `;
  notifDiv.innerHTML = `
    <h3 style="margin:0 0 5px 0">${notification.title}</h3>
    <p style="margin:0">${notification.body}</p>
  `;
  
  document.body.appendChild(notifDiv);
  
  // Supprimer après 5 secondes
  setTimeout(() => notifDiv.remove(), 5000);
}
```

---

## 📊 RÉCUPÉRER LES NOTIFICATIONS DÉJÀ AFFICHÉES

```javascript
// Obtenir toutes les notifications dans le centre de notifications
const getNotifications = async () => {
  const result = await PushNotifications.getDeliveredNotifications();
  console.log('Notifications:', result.notifications);
  return result.notifications;
};

// Supprimer toutes les notifications
const clearNotifications = async () => {
  await PushNotifications.removeAllDeliveredNotifications();
  console.log('✅ Notifications supprimées');
};

// Utilisation
getNotifications().then(notifs => {
  console.log(`Vous avez ${notifs.length} notifications`);
});
```

---

## ✅ CHECKLIST RAPIDE

- [ ] Plugin installé : `npm install @capacitor/push-notifications`
- [ ] Code copié dans le fichier principal de votre app
- [ ] `npx cap sync` exécuté
- [ ] App lancée sur appareil physique (pas simulateur)
- [ ] Token affiché dans les logs
- [ ] Notification de test envoyée depuis Firebase Console
- [ ] Notification reçue sur l'appareil ✅

---

## 🆘 ÇA NE MARCHE PAS ?

### Erreur : "PushNotifications is not defined"
```bash
npm install @capacitor/push-notifications
npx cap sync
```

### Le token n'apparaît pas
- Vérifiez que vous testez sur un appareil PHYSIQUE (pas simulateur)
- Vérifiez les logs dans Xcode
- Relancez l'application

### La permission est refusée
- Désinstallez l'app
- Réinstallez-la
- Acceptez la permission

### Les notifications n'apparaissent pas
- Vérifiez que le certificat APNs est configuré dans Firebase Console
- Vérifiez que vous utilisez le bon token
- Vérifiez le format de votre notification (voir firebase-notification-payloads-examples.js)

---

## 🎉 C'EST TOUT !

Avec ce code simple, vous avez maintenant :
✅ Demande de permission  
✅ Enregistrement pour les notifications  
✅ Réception du token  
✅ Écoute des notifications  
✅ Gestion des actions  

**Testez maintenant sur votre appareil ! 🚀**

Pour plus d'exemples, consultez :
- **NotificationService-Example.ts** - Version complète avec service
- **GUIDE-CODE-JAVASCRIPT.md** - Guide détaillé par framework
- **firebase-notification-payloads-examples.js** - Exemples backend
