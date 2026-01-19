#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WidgetDataPlugin, "WidgetDataPlugin",
  CAP_PLUGIN_METHOD(updateWidgetData, CAPPluginReturnPromise);
)
