# 🔍 Diagnostic des Notifications Firebase - Résumé

## ❌ PROBLÈMES IDENTIFIÉS ET CORRIGÉS

### 1. **Conflit majeur de délégué UNUserNotificationCenter** ⚠️
**Problème :**
```swift
// Dans AppDelegate.swift (LIGNE 13)
UNUserNotificationCenter.current().delegate = self
```

**Explication :**
- Votre `AppDelegate` définissait lui-même comme délégué de UNUserNotificationCenter
- MAIS Capacitor utilise son propre système `NotificationRouter` qui doit aussi être le délégué
- Résultat : Les deux systèmes se battent pour contrôler les notifications
- **Les notifications ne sont jamais transmises correctement à Capacitor**

**Solution appliquée :**
- ✅ Suppression de cette ligne
- ✅ Le `NotificationRouter` de Capacitor gère maintenant les notifications
- ✅ Les méthodes `willPresent` et `didReceive` ont été supprimées de AppDelegate

---

### 2. **Absence du délégué Firebase Messaging** 🔥
**Problème :**
- Firebase Messaging n'était jamais configuré avec un délégué
- Vous ne receviez donc JAMAIS le token FCM
- Sans token FCM, impossible d'envoyer des notifications ciblées

**Solution appliquée :**
```swift
// Ajouté dans didFinishLaunchingWithOptions
Messaging.messaging().delegate = self

// Extension MessagingDelegate ajoutée
extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("📱 Firebase FCM Token: \(fcmToken)")
    }
}
```

---

### 3. **Pas de présentation par défaut** 📱
**Problème :**
Dans `PushNotificationsHandler.swift`, la méthode `willPresent` retournait `[]` par défaut :
```swift
return []  // ❌ Aucune notification n'apparaissait !
```

**Solution appliquée :**
```swift
// Valeur par défaut : afficher la notification avec tous les éléments
if #available(iOS 14.0, *) {
    return [.banner, .badge, .sound]
} else {
    return [.alert, .badge, .sound]
}
```

---

### 4. **Support iOS 13 vs iOS 14+** 📱
**Problème :**
- `.banner` n'existe que depuis iOS 14
- Sur iOS 13, cela causait un crash ou une erreur

**Solution appliquée :**
```swift
if #available(iOS 14.0, *) {
    presentationOptions.insert(.banner)
} else {
    presentationOptions.insert(.alert)
}
```

---

## ✅ MODIFICATIONS APPORTÉES

### Fichier : `AppDelegate.swift`

**Avant :**
```swift
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions...) {
        FirebaseApp.configure()
        UNUserNotificationCenter.current().delegate = self // ❌ CONFLIT
        // Demande d'autorisation forcée
    }
    
    // Méthodes willPresent et didReceive qui créent des conflits
}
```

**Après :**
```swift
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions...) {
        FirebaseApp.configure()
        Messaging.messaging().delegate = self // ✅ NOUVEAU
        // Plus de delegate UNUserNotificationCenter
        // Plus de demande forcée d'autorisation
    }
}

extension AppDelegate: MessagingDelegate { // ✅ NOUVEAU
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("📱 Firebase FCM Token: \(fcmToken)")
    }
}
```

---

### Fichier : `PushNotificationsHandler.swift`

**Avant :**
```swift
public func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions {
    // ... logique ...
    return [] // ❌ RIEN N'APPARAÎT
}
```

**Après :**
```swift
public func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions {
    // ... logique ...
    
    // Valeur par défaut avec support iOS 13
    if #available(iOS 14.0, *) {
        return [.banner, .badge, .sound] // ✅ AFFICHAGE
    } else {
        return [.alert, .badge, .sound]
    }
}
```

---

## 🧪 COMMENT VÉRIFIER QUE ÇA FONCTIONNE

### 1. Nettoyez et recompilez
```bash
# Dans le terminal
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Ou dans Xcode
Product → Clean Build Folder (Cmd+Shift+K)
Product → Build (Cmd+B)
```

### 2. Lancez l'app sur un appareil réel
⚠️ **Les notifications NE FONCTIONNENT PAS dans le simulateur !**

### 3. Vérifiez les logs Xcode
Vous devriez voir :
```
📱 Firebase FCM Token: [UN_LONG_TOKEN]
```

**Si vous ne voyez pas ce token, vérifiez :**
- [ ] GoogleService-Info.plist est présent
- [ ] Capabilities → Push Notifications est activé
- [ ] L'appareil est bien connecté (pas le simulateur)

### 4. Testez avec Firebase Console
1. Allez sur https://console.firebase.google.com
2. Votre projet → Cloud Messaging
3. "Envoyer votre premier message"
4. Copiez le token FCM depuis les logs
5. "Envoyer un message de test" → Collez le token

---

## 📋 CHECKLIST FINALE

### Configuration Xcode
- [ ] GoogleService-Info.plist dans le projet
- [ ] Signing & Capabilities → Push Notifications activé
- [ ] Signing & Capabilities → Background Modes → Remote notifications activé
- [ ] Certificat APNs configuré dans Firebase Console
- [ ] Provisioning profile avec Push Notifications

### Code Swift
- [x] ✅ AppDelegate ne définit plus le delegate UNUserNotificationCenter
- [x] ✅ MessagingDelegate implémenté
- [x] ✅ PushNotificationsHandler retourne des valeurs par défaut
- [x] ✅ Support iOS 13/14+ géré

### Code JavaScript/TypeScript
- [ ] Plugin @capacitor/push-notifications installé
- [ ] Service de notifications initialisé au démarrage
- [ ] Listeners configurés pour :
  - `registration` → Récupérer le token
  - `registrationError` → Gérer les erreurs
  - `pushNotificationReceived` → App au premier plan
  - `pushNotificationActionPerformed` → Utilisateur tape sur la notification

### Backend
- [ ] Token FCM stocké pour chaque utilisateur
- [ ] Endpoint pour envoyer des notifications
- [ ] Format de payload correct (voir firebase-notification-payloads-examples.js)
- [ ] Clé serveur Firebase (Server Key) configurée

---

## 🚨 SI ÇA NE FONCTIONNE TOUJOURS PAS

### Vérification 1 : Token APNS reçu ?
```swift
// Ajoutez dans didRegisterForRemoteNotificationsWithDeviceToken
let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
print("🔑 APNS Token: \(tokenString)")
```

### Vérification 2 : Token FCM reçu ?
```swift
// Déjà dans MessagingDelegate
print("📱 Firebase FCM Token: \(fcmToken)")
```

### Vérification 3 : Certificat APNs valide ?
- Firebase Console → Paramètres projet → Cloud Messaging
- Section iOS → APNs Certificates
- Vérifier la date d'expiration

### Vérification 4 : Format de notification correct ?
```json
{
  "to": "VOTRE_TOKEN_FCM",
  "notification": {
    "title": "Test",
    "body": "Message de test"
  },
  "priority": "high"
}
```

### Vérification 5 : Permissions accordées ?
```swift
UNUserNotificationCenter.current().getNotificationSettings { settings in
    print("Status: \(settings.authorizationStatus.rawValue)")
    // 0 = notDetermined, 1 = denied, 2 = authorized, 3 = provisional
}
```

---

## 📞 AIDE SUPPLÉMENTAIRE

Si les notifications ne fonctionnent toujours pas après ces modifications :

1. **Vérifiez les logs Xcode** pour toute erreur
2. **Testez sur un appareil physique** (jamais simulateur)
3. **Vérifiez que l'app n'est pas en mode "Ne pas déranger"**
4. **Désinstallez et réinstallez l'app** pour réinitialiser les permissions
5. **Vérifiez que le certificat APNs correspond à l'App ID**

---

## 🎉 RÉSULTAT ATTENDU

Après ces corrections, vous devriez pouvoir :
- ✅ Recevoir le token FCM dans les logs
- ✅ Envoyer des notifications depuis Firebase Console
- ✅ Voir les notifications apparaître sur l'appareil
- ✅ Recevoir les événements dans votre code JavaScript
- ✅ Router l'utilisateur quand il tape sur une notification

Bonne chance ! 🚀
