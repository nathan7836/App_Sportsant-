import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // 1. Initialisation de Firebase
        FirebaseApp.configure()
        print("🔥 Firebase configured")
        
        // 2. Configuration Firebase Messaging
        Messaging.messaging().delegate = self
        print("🔥 Firebase Messaging delegate set")

        // 3. Catégorie par défaut pour les notifications
        let generalCategory = UNNotificationCategory(
            identifier: "general",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        UNUserNotificationCenter.current().setNotificationCategories([generalCategory])
        
        // 4. Log l'état actuel des permissions
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            print("📱 Notification authorization status: \(settings.authorizationStatus.rawValue)")
            // 0=notDetermined, 1=denied, 2=authorized, 3=provisional
        }

        return true
    }

    // --- Gestion des Tokens ---

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("🔑 APNs Device Token (hex): \(tokenString)")
        print("🔑 APNs Token length: \(tokenString.count) chars")
        
        // Envoi à Firebase (pour le mapping APNs -> FCM)
        Messaging.messaging().apnsToken = deviceToken
        
        // Envoi à Capacitor (pour le JS)
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
        print("✅ Token sent to both Firebase and Capacitor")
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error.localizedDescription)")
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }

    // --- Méthodes Capacitor ---

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

// MARK: - Firebase Messaging Delegate
extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        if let token = fcmToken {
            print("📱 Firebase FCM Token: \(token)")
            print("📱 FCM Token length: \(token.count) chars")
            NotificationCenter.default.post(
                name: Notification.Name("FCMTokenRefresh"),
                object: nil,
                userInfo: ["token": token]
            )
        } else {
            print("⚠️ Firebase FCM Token is nil")
        }
    }
}
