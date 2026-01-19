import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sportsante.app',
  appName: 'Sportsanté-IOS',
  webDir: 'public',
  server: {
    url: 'http://82.165.195.155',
    cleartext: true
  }
};

export default config;
