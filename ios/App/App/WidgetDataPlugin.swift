import Foundation
import Capacitor
import WidgetKit

@objc(WidgetDataPlugin)
public class WidgetDataPlugin: CAPPlugin {
    @objc func updateWidgetData(_ call: CAPPluginCall) {
        let nextSession = call.getString("nextSession") ?? ""
        let time = call.getString("time") ?? ""
        let coach = call.getString("coach") ?? ""
        
        // Define structure matching WidgetData
        struct WidgetData: Codable {
            let nextSession: String
            let time: String
            let coach: String
        }

        let dataToSave = WidgetData(nextSession: nextSession, time: time, coach: coach)

        // Write to App Group UserDefaults
        // ⚠️ MUST MATCH THE SUITE NAME IN THE WIDGET
        if let userDefaults = UserDefaults(suiteName: "group.com.sportsante.app") {
            if let encoded = try? JSONEncoder().encode(dataToSave) {
                userDefaults.set(encoded, forKey: "widgetData")
                // Force Widget Reload
                if #available(iOS 14.0, *) {
                    WidgetCenter.shared.reloadAllTimelines()
                }
                call.resolve(["success": true])
            } else {
                call.reject("Failed to encode data")
            }
        } else {
            call.reject("Could not access App Group UserDefaults. Check Entitlements.")
        }
    }
}
