import WidgetKit
import SwiftUI

// MARK: - Shared Data Structure
// This must match the JSON we send from the web app
struct WidgetData: Codable {
    let nextSession: String
    let time: String
    let coach: String
}

// MARK: - Timeline Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// MARK: - Widget View
struct SportsanteWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Image(systemName: "figure.run.circle.fill")
                    .font(.title2)
                    .foregroundColor(.white)
                
                Text("Sportsanté")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundColor(.white.opacity(0.9))
                
                Spacer()
            }
            
            Spacer()
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text("PROCHAINE SÉANCE")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.white.opacity(0.6))
                    .textCase(.uppercase)
                
                Text(entry.data.nextSession)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(1)
                
                HStack(spacing: 6) {
                    Label(entry.data.time, systemImage: "clock.fill")
                    Text("•")
                    Label(entry.data.coach, systemImage: "person.fill")
                }
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
            }
        }
        .padding()
        .background(
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.55, green: 0.36, blue: 0.96),
                    Color(red: 0.30, green: 0.11, blue: 0.58)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .widgetBackground(Color(red: 0.55, green: 0.36, blue: 0.96))
    }
}

// MARK: - Provider
struct Provider: TimelineProvider {
    // ⚠️ IMPORTANT: Access the App Group Shared UserDefaults
    // You MUST replace "group.com.sportsante.app" with your actual App Group ID if different
    let userDefaults = UserDefaults(suiteName: "group.com.sportsante.app")

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), data: WidgetData(nextSession: "Chargement...", time: "--:--", coach: "--"))
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), data: WidgetData(nextSession: "Crossfit", time: "14:00", coach: "Nathan"))
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        var entries: [SimpleEntry] = []
        let currentDate = Date()
        
        // 1. Fetch data from UserDefaults
        var widgetData = WidgetData(nextSession: "Aucune séance", time: "", coach: "")
        
        if let savedData = userDefaults?.data(forKey: "widgetData"),
           let decoded = try? JSONDecoder().decode(WidgetData.self, from: savedData) {
            widgetData = decoded
        }

        // 2. Create Entry
        let entry = SimpleEntry(date: currentDate, data: widgetData)
        entries.append(entry)

        // 3. Refresh policy (reload after 15 minutes or when app requests it)
        let timeline = Timeline(entries: entries, policy: .after(Date().addingTimeInterval(900)))
        completion(timeline)
    }
}

// MARK: - Main Widget Configuration
struct SportsanteWidget: Widget {
    let kind: String = "SportsanteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            SportsanteWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prochaine Séance")
        .description("Affichez votre prochaine séance de sport.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Previews
struct SportsanteWidget_Previews: PreviewProvider {
    static var previews: some View {
        SportsanteWidgetEntryView(entry: SimpleEntry(date: Date(), data: WidgetData(nextSession: "Crossfit", time: "10:00", coach: "Alex")))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}

// MARK: - Legacy Support Extensions
extension View {
    @ViewBuilder
    func widgetBackground(_ backgroundView: some View) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) {
                backgroundView
            }
        } else {
            self.background(backgroundView)
        }
    }
}