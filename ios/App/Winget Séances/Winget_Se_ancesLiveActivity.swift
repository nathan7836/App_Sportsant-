//
//  Winget_Se_ancesLiveActivity.swift
//  Winget Séances
//
//  Created by Nathan LAMTARA on 15/01/2026.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct Winget_Se_ancesAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct Winget_Se_ancesLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: Winget_Se_ancesAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension Winget_Se_ancesAttributes {
    fileprivate static var preview: Winget_Se_ancesAttributes {
        Winget_Se_ancesAttributes(name: "World")
    }
}

extension Winget_Se_ancesAttributes.ContentState {
    fileprivate static var smiley: Winget_Se_ancesAttributes.ContentState {
        Winget_Se_ancesAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: Winget_Se_ancesAttributes.ContentState {
         Winget_Se_ancesAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: Winget_Se_ancesAttributes.preview) {
   Winget_Se_ancesLiveActivity()
} contentStates: {
    Winget_Se_ancesAttributes.ContentState.smiley
    Winget_Se_ancesAttributes.ContentState.starEyes
}
