# 🔔 Correction du système de notifications Firebase

## 📝 Résumé des modifications

Les notifications Firebase ne fonctionnaient pas à cause de **plusieurs problèmes critiques** qui ont été identifiés et corrigés :

1. **Conflit de délégué** : AppDelegate se définissait comme délégué de `UNUserNotificationCenter`, entrant en conflit avec le `NotificationRouter` de Capacitor
2. **Absence du délégué Firebase Messaging** : Le token FCM n'était jamais reçu
3. **Pas de présentation par défaut** : Les notifications n'apparaissaient pas quand l'app était ouverte
4. **Problème de compatibilité iOS** : `.banner` n'existe pas sur iOS 13

## ✅ Fichiers modifiés

### 1. `AppDelegate.swift` ⚠️ **IMPORTANT**
- ❌ Supprimé : `UNUserNotificationCenter.current().delegate = self`
- ❌ Supprimé : Méthodes `willPresent` et `didReceive`
- ✅ Ajouté : `Messaging.messaging().delegate = self`
- ✅ Ajouté : Extension `MessagingDelegate` pour recevoir le token FCM

### 2. `PushNotificationsHandler.swift`
- ✅ Modifié : Retourne maintenant `[.banner, .badge, .sound]` par défaut
- ✅ Ajouté : Support pour iOS 13 avec `@available(iOS 14.0, *)`
- ✅ Corrigé : Faute de frappe "Unrecogizned" → "Unrecognized"

## 📚 Nouveaux fichiers créés

### Documentation
- 📄 **DIAGNOSTIC-COMPLET.md** : Explication détaillée des problèmes et solutions
- 📄 **FIREBASE-NOTIFICATIONS-GUIDE.md** : Guide de configuration complet
- 📄 **README-NOTIFICATIONS.md** : Ce fichier

### Code exemples
- 💻 **NotificationService-Example.ts** : Service TypeScript prêt à l'emploi pour gérer les notifications
- 💻 **firebase-notification-payloads-examples.js** : Exemples de payloads pour votre backend
- 🔧 **test-notifications.sh** : Script bash pour vérifier votre configuration

## 🚀 Prochaines étapes

### 1. Vérifiez la configuration Xcode

Ouvrez votre projet dans Xcode et vérifiez :

```
Signing & Capabilities → 
  ✅ Push Notifications (activé)
  ✅ Background Modes → Remote notifications (coché)
```

### 2. Vérifiez GoogleService-Info.plist

Le fichier doit être présent dans :
```
ios/App/App/GoogleService-Info.plist
```

Si absent, téléchargez-le depuis Firebase Console.

### 3. Nettoyez et recompilez

```bash
# Terminal
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Ou dans Xcode
Product → Clean Build Folder (Cmd+Shift+K)
Product → Build (Cmd+B)
```

### 4. Testez sur un appareil réel

⚠️ **IMPORTANT** : Les notifications ne fonctionnent PAS dans le simulateur !

```bash
# Lancez l'app sur votre iPhone/iPad
# Dans Xcode: Product → Destination → [Votre appareil]
# Product → Run (Cmd+R)
```

### 5. Vérifiez les logs

Dans la console Xcode, vous devriez voir :

```
📱 Firebase FCM Token: [UN_LONG_TOKEN]
```

**Copiez ce token !** Vous en aurez besoin pour les tests.

### 6. Testez depuis Firebase Console

1. Ouvrez https://console.firebase.google.com
2. Allez dans **Cloud Messaging**
3. Cliquez sur **"Envoyer votre premier message"**
4. Dans "Envoyer un message de test", collez le token FCM
5. Cliquez sur **"Tester"**

✅ Vous devriez recevoir la notification sur votre appareil !

## 💻 Intégration dans votre code

### Option 1 : Utiliser le service TypeScript fourni

Copiez le contenu de `NotificationService-Example.ts` dans votre projet :

```typescript
// Dans votre App.tsx ou main.ts
import { NotificationService } from './services/NotificationService';

const notificationService = new NotificationService();
notificationService.initializePushNotifications();
```

### Option 2 : Configuration manuelle

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Demander les permissions
const permission = await PushNotifications.requestPermissions();

if (permission.receive === 'granted') {
  // S'enregistrer
  await PushNotifications.register();
  
  // Écouter le token
  PushNotifications.addListener('registration', (token) => {
    console.log('Token:', token.value);
    // Envoyez ce token à votre backend
  });
  
  // Écouter les notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification reçue:', notification);
  });
  
  // Écouter les actions
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Action:', action);
    // Router l'utilisateur vers la bonne page
  });
}
```

## 🔧 Backend - Envoyer des notifications

### Option A : Firebase Admin SDK (Recommandé)

```javascript
const admin = require('firebase-admin');

await admin.messaging().send({
  token: 'DEVICE_FCM_TOKEN',
  notification: {
    title: 'Nouvelle commande',
    body: 'Commande #12345 créée'
  },
  data: {
    orderId: '12345',
    route: '/orders/12345'
  }
});
```

### Option B : API REST

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=VOTRE_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Message de test"
    }
  }'
```

Consultez `firebase-notification-payloads-examples.js` pour plus d'exemples.

## 🐛 Dépannage

### Les notifications n'apparaissent pas

1. **Vérifiez les logs Xcode** : Vous devez voir le token FCM
2. **Vérifiez l'appareil** : Doit être physique, pas simulateur
3. **Vérifiez les permissions** : L'utilisateur doit avoir accepté
4. **Vérifiez le certificat APNs** : Dans Firebase Console
5. **Vérifiez le format** : Voir les exemples de payloads

### Le token FCM n'apparaît pas

1. Vérifiez que `Messaging.messaging().delegate = self` est bien dans AppDelegate
2. Vérifiez que `GoogleService-Info.plist` est présent
3. Vérifiez que l'appareil a une connexion internet
4. Réinstallez l'app pour réinitialiser

### L'app crash au lancement

1. Nettoyez le build : `Product → Clean Build Folder`
2. Supprimez `Pods` et `Podfile.lock`, puis `pod install`
3. Vérifiez que Firebase est bien initialisé dans `didFinishLaunchingWithOptions`

## 📖 Documentation complète

Pour plus de détails, consultez :

- 📄 **DIAGNOSTIC-COMPLET.md** - Diagnostic détaillé des problèmes
- 📄 **FIREBASE-NOTIFICATIONS-GUIDE.md** - Guide de configuration complet
- 💻 **NotificationService-Example.ts** - Code TypeScript prêt à l'emploi
- 💻 **firebase-notification-payloads-examples.js** - Exemples backend
- 🔧 **test-notifications.sh** - Script de vérification

## 🆘 Besoin d'aide ?

Si vous rencontrez toujours des problèmes après avoir suivi ce guide :

1. Exécutez le script de test : `bash test-notifications.sh`
2. Consultez `DIAGNOSTIC-COMPLET.md` pour un dépannage approfondi
3. Vérifiez les logs Xcode pour toute erreur
4. Assurez-vous de tester sur un appareil physique

## ✨ Résultat attendu

Après ces corrections, vous devriez pouvoir :

- ✅ Recevoir le token FCM dans les logs
- ✅ Envoyer des notifications depuis Firebase Console
- ✅ Voir les notifications apparaître sur l'appareil
- ✅ Recevoir les événements dans votre code JavaScript/TypeScript
- ✅ Gérer les actions quand l'utilisateur tape sur une notification
- ✅ Personnaliser les notifications avec des données

Bonne chance ! 🚀

---

**Dernière mise à jour** : 15 février 2026  
**Version** : 1.0.0
