# 🔔 Guide de configuration des notifications Firebase

## ✅ Problèmes corrigés

### 1. **Conflit de délégué UNUserNotificationCenter**
- **Problème** : L'AppDelegate définissait `UNUserNotificationCenter.current().delegate = self`, ce qui entre en conflit avec le `NotificationRouter` de Capacitor
- **Solution** : Suppression de cette ligne et délégation à Capacitor pour gérer les notifications

### 2. **Absence du délégué Firebase Messaging**
- **Problème** : Firebase Messaging n'avait pas de délégué configuré pour recevoir le token FCM
- **Solution** : Ajout de `Messaging.messaging().delegate = self` et implémentation de `MessagingDelegate`

### 3. **Support iOS 13 vs iOS 14+**
- **Problème** : `.banner` n'existe pas sur iOS 13, causant des erreurs
- **Solution** : Vérification de disponibilité avec `@available(iOS 14.0, *)`

### 4. **Pas de présentation par défaut**
- **Problème** : Le handler retournait `[]` par défaut, donc les notifications n'apparaissaient pas
- **Solution** : Retour de `[.banner, .badge, .sound]` par défaut

---

## 📋 Checklist de configuration

### 1. **Fichiers Xcode requis**

- [ ] ✅ `GoogleService-Info.plist` présent dans le projet
- [ ] ✅ Capabilities activées dans Xcode :
  - Push Notifications
  - Background Modes → Remote notifications
- [ ] ✅ Certificat APNs configuré dans Firebase Console

### 2. **Code Swift**

- [x] ✅ `AppDelegate.swift` corrigé (ne définit plus le delegate)
- [x] ✅ `MessagingDelegate` ajouté pour recevoir le token FCM
- [x] ✅ `PushNotificationsHandler.swift` mis à jour avec valeurs par défaut
- [x] ✅ Gestion correcte iOS 13 vs iOS 14+

### 3. **Configuration Capacitor**

Assurez-vous que votre `capacitor.config.ts` ou `capacitor.config.json` contient :

```typescript
{
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
}
```

### 4. **Package.json**

Vérifiez que vous avez les dépendances :

```json
{
  "@capacitor/push-notifications": "^5.x.x"
}
```

---

## 🧪 Comment tester

### 1. **Vérifier l'enregistrement**

Dans votre console Xcode, vous devriez voir :
```
📱 Firebase FCM Token: [VOTRE_TOKEN_FCM]
```

### 2. **Tester avec Firebase Console**

1. Allez dans Firebase Console → Cloud Messaging
2. Cliquez sur "Envoyer votre premier message"
3. Entrez un titre et un message
4. Cliquez sur "Envoyer un message de test"
5. Collez le token FCM affiché dans la console

### 3. **Tester avec curl**

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=VOTRE_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "VOTRE_TOKEN_FCM",
    "notification": {
      "title": "Test",
      "body": "Notification de test"
    },
    "data": {
      "orderId": "12345",
      "route": "/orders"
    }
  }'
```

---

## 🔍 Débogage

### Si vous ne recevez toujours pas de notifications :

1. **Vérifier les permissions**
   ```swift
   // Dans AppDelegate, ajoutez temporairement :
   UNUserNotificationCenter.current().getNotificationSettings { settings in
       print("🔔 Authorization Status: \(settings.authorizationStatus.rawValue)")
       // 0 = notDetermined, 1 = denied, 2 = authorized
   }
   ```

2. **Vérifier le token APNS**
   - Le token doit être envoyé à Firebase via `Messaging.messaging().apnsToken`
   - Vérifiez dans la console qu'il est bien affiché

3. **Vérifier le token FCM**
   - Le token FCM doit être reçu via `messaging(_:didReceiveRegistrationToken:)`
   - C'est ce token que vous devez utiliser pour envoyer des notifications

4. **Vérifier le format de notification**
   
   Firebase nécessite un format spécifique :
   ```json
   {
     "notification": {
       "title": "Titre",
       "body": "Message"
     },
     "data": {
       "key": "value"
     }
   }
   ```

5. **Vérifier les certificats APNs**
   - Dans Firebase Console → Paramètres du projet → Cloud Messaging
   - Vérifiez que le certificat APNs est valide et non expiré

---

## 📱 Comportement attendu

### App au premier plan
- La notification arrive via `pushNotificationReceived`
- Elle s'affiche comme une bannière en haut de l'écran
- L'utilisateur peut taper dessus pour ouvrir l'app

### App en arrière-plan ou fermée
- La notification s'affiche dans le centre de notifications
- Quand l'utilisateur tape dessus, `pushNotificationActionPerformed` est déclenché

### Données personnalisées
- Utilisez le champ `data` pour passer des informations supplémentaires
- Accessible via `notification.data` dans vos listeners

---

## 🚀 Prochaines étapes

1. Testez l'envoi d'une notification depuis Firebase Console
2. Vérifiez les logs dans Xcode pour voir les tokens
3. Implémentez le service de notifications dans votre code JavaScript/TypeScript
4. Envoyez le token FCM à votre backend
5. Gérez les actions de notification pour router vers les bonnes pages

---

## 💡 Conseils supplémentaires

- **Ne forcez pas la demande de permission au démarrage** : Demandez-la au bon moment dans le parcours utilisateur
- **Testez sur un appareil réel** : Les notifications ne fonctionnent pas dans le simulateur
- **Utilisez les données personnalisées** : Pour router l'utilisateur vers la bonne page
- **Gérez les badges** : Pensez à les réinitialiser quand approprié
- **Testez les deux scénarios** : App ouverte et app fermée

Bonne chance ! 🎉
