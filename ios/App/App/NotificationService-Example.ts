/**
 * Exemple de service pour gérer les notifications Firebase avec Capacitor
 * 
 * Ce fichier montre comment configurer et utiliser les notifications push
 * dans votre application Capacitor avec Firebase.
 */

import { PushNotifications } from '@capacitor/push-notifications';

export class NotificationService {
  
  /**
   * Initialise le service de notifications
   * Doit être appelé au démarrage de l'application
   */
  async initializePushNotifications(): Promise<void> {
    try {
      // 1. Vérifier les permissions actuelles
      const permStatus = await PushNotifications.checkPermissions();
      console.log('📱 Permission status:', permStatus);

      // 2. Demander la permission si nécessaire
      if (permStatus.receive === 'prompt') {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== 'granted') {
          console.warn('⚠️ Permission refusée pour les notifications');
          return;
        }
      }

      // 3. Enregistrer l'appareil pour les notifications
      await PushNotifications.register();
      console.log('✅ Enregistrement pour les notifications réussi');

      // 4. Configurer les listeners
      this.setupNotificationListeners();

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  /**
   * Configure tous les listeners pour les événements de notification
   */
  private setupNotificationListeners(): void {
    
    // Quand l'enregistrement réussit et qu'on reçoit le token
    PushNotifications.addListener('registration', (token) => {
      console.log('📱 Device Token (APNS):', token.value);
      // Le token FCM sera disponible via le delegate Firebase
      // Vous devriez l'envoyer à votre serveur backend ici
      this.sendTokenToServer(token.value);
    });

    // En cas d'erreur d'enregistrement
    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Erreur d\'enregistrement:', error);
    });

    // Quand une notification arrive pendant que l'app est ouverte
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📩 Notification reçue (app ouverte):', notification);
      
      // Vous pouvez afficher une alerte personnalisée ou mettre à jour l'UI
      this.handleForegroundNotification(notification);
    });

    // Quand l'utilisateur tape sur une notification
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('👆 Notification tapée:', action);
      
      const data = action.notification.data;
      console.log('📦 Données de la notification:', data);
      
      // Router l'utilisateur vers la bonne page en fonction des données
      this.handleNotificationAction(action);
    });
  }

  /**
   * Envoie le token à votre serveur backend
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // Remplacez par votre endpoint API
      // await fetch('https://votre-api.com/register-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, platform: 'ios' })
      // });
      console.log('🚀 Token envoyé au serveur:', token);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du token:', error);
    }
  }

  /**
   * Gère une notification reçue quand l'app est au premier plan
   */
  private handleForegroundNotification(notification: any): void {
    // Exemple : afficher une alerte ou un toast
    console.log('Titre:', notification.title);
    console.log('Corps:', notification.body);
    console.log('Données:', notification.data);
    
    // Vous pouvez afficher une notification personnalisée dans votre UI
    // ou mettre à jour l'état de l'application
  }

  /**
   * Gère l'action d'un utilisateur tapant sur une notification
   */
  private handleNotificationAction(action: any): void {
    const { data } = action.notification;
    
    // Exemple de navigation basée sur les données
    if (data?.route) {
      // this.router.navigate([data.route]);
      console.log('📍 Navigation vers:', data.route);
    }
    
    if (data?.orderId) {
      // Ouvrir la page de commande
      console.log('🛍️ Ouvrir la commande:', data.orderId);
    }
  }

  /**
   * Récupère la liste des notifications délivrées
   */
  async getDeliveredNotifications(): Promise<any[]> {
    try {
      const result = await PushNotifications.getDeliveredNotifications();
      console.log('📬 Notifications délivrées:', result.notifications);
      return result.notifications;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  /**
   * Supprime toutes les notifications de la barre de notification
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await PushNotifications.removeAllDeliveredNotifications();
      console.log('✅ Toutes les notifications ont été supprimées');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des notifications:', error);
    }
  }

  /**
   * Se désabonne des notifications
   */
  async unregister(): Promise<void> {
    try {
      await PushNotifications.unregister();
      console.log('🔕 Désabonnement des notifications réussi');
    } catch (error) {
      console.error('❌ Erreur lors du désabonnement:', error);
    }
  }
}

// Exemple d'utilisation dans votre App.tsx / App.vue / main.ts
// const notificationService = new NotificationService();
// notificationService.initializePushNotifications();
