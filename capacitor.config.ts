import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sportsante.app',
  appName: 'SportSanté',
  webDir: 'public',
  server: {
    url: 'http://82.165.195.155:3000',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: '#f8f7ff',
    preferredContentMode: 'mobile'
  },
  android: {
    backgroundColor: '#f8f7ff',
    allowMixedContent: false,
    appendUserAgent: 'SportSante-Android'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f8f7ff',
      overlaysWebView: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
