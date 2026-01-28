//
//  widgetBundle.swift
//  widget
//
//  Created by Nathan LAMTARA on 15/01/2026.
//

import WidgetKit
import SwiftUI

@main
struct widgetBundle: WidgetBundle {
    var body: some Widget {
        SportsanteWidget()
        // widgetControl() // Disabled: Incompatible with iOS 15 Target (ControlWidget is not a Widget)
        
        // Live Activity disabled for broader compatibility
        // if #available(iOS 16.1, *) {
        //    widgetLiveActivity()
        // }
    }
}
