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
        
        // 2. Configuration Firebase Messaging (IMPORTANT!)
        Messaging.messaging().delegate = self

        // 3. NE PAS définir le delegate ici - laissez Capacitor le gérer
        // Le NotificationRouter de Capacitor va gérer les notifications
        
        // 4. Catégorie par défaut
        let generalCategory = UNNotificationCategory(
            identifier: "general",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        UNUserNotificationCenter.current().setNotificationCategories([generalCategory])

        return true
    }

    // --- Gestion des Tokens ---

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Envoi à Firebase
        Messaging.messaging().apnsToken = deviceToken
        
        // Envoi à Capacitor
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
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
            // Vous pouvez envoyer ce token à votre serveur
            NotificationCenter.default.post(
                name: Notification.Name("FCMTokenRefresh"),
                object: nil,
                userInfo: ["token": token]
            )
        }
    }
}

