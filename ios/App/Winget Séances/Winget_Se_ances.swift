import WidgetKit
import SwiftUI
import AppIntents

// 1. Le moteur du Widget (Provider)
struct Provider: AppIntentTimelineProvider {
    // On définit explicitement que l'entrée est SimpleEntry
    typealias Entry = SimpleEntry

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []
        let currentDate = Date()
        
        // Génère 5 points dans le temps (un par heure)
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}

// 2. Le modèle de données (Entry)
struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}

// 3. Le Design du Widget (La Vue)
struct Winget_Se_ancesEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(spacing: 8) {
            Text("Séance")
                .font(.headline)
                .foregroundColor(.blue)
            
            Text(entry.date, style: .time)
                .font(.subheadline)

            HStack {
                Text("Mood:")
                Text(entry.configuration.favoriteEmoji)
            }
            .font(.caption)
        }
    }
}

// 4. La configuration du Widget
struct Winget_Se_ances: Widget {
    let kind: String = "Winget_Se_ances"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            Winget_Se_ancesEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
    }
}

// 5. Données de test pour l'aperçu
extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "😀"
        return intent
    }
    
    fileprivate static var starEyes: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "🤩"
        return intent
    }
}

// 6. L'aperçu (Preview) corrigé
#Preview(as: .systemSmall) {
    Winget_Se_ances()
} timeline: {
    SimpleEntry(date: .now, configuration: .smiley)
    SimpleEntry(date: .now, configuration: .starEyes)
}
