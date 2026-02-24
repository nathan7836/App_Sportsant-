/**
 * Exemples de payloads de notification Firebase pour iOS
 * 
 * Ces exemples montrent comment structurer vos notifications depuis votre backend
 */

// ==============================================================================
// EXEMPLE 1 : Notification simple
// ==============================================================================

const simpleNotification = {
  to: "DEVICE_FCM_TOKEN", // Token FCM de l'appareil
  notification: {
    title: "Nouvelle commande",
    body: "Vous avez reçu une nouvelle commande !"
  }
};

// ==============================================================================
// EXEMPLE 2 : Notification avec données personnalisées
// ==============================================================================

const notificationWithData = {
  to: "DEVICE_FCM_TOKEN",
  notification: {
    title: "Commande #12345 expédiée",
    body: "Votre commande a été expédiée et arrivera dans 2 jours"
  },
  data: {
    orderId: "12345",
    route: "/orders/12345",
    action: "view_order",
    timestamp: "2026-02-15T10:30:00Z"
  }
};

// ==============================================================================
// EXEMPLE 3 : Notification avec badge et son personnalisé
// ==============================================================================

const notificationWithBadge = {
  to: "DEVICE_FCM_TOKEN",
  notification: {
    title: "3 nouveaux messages",
    body: "Marie, Paul et Sophie vous ont envoyé un message",
    badge: "3", // Nombre à afficher sur l'icône de l'app
    sound: "default" // Ou le nom d'un fichier son personnalisé
  },
  data: {
    type: "new_messages",
    messageIds: "101,102,103"
  }
};

// ==============================================================================
// EXEMPLE 4 : Notification silencieuse (data-only)
// ==============================================================================
// Utile pour synchroniser des données sans notifier l'utilisateur

const silentNotification = {
  to: "DEVICE_FCM_TOKEN",
  data: {
    silent: "true",
    syncAction: "refresh_orders",
    lastUpdate: "2026-02-15T10:30:00Z"
  },
  content_available: true // Important pour iOS
};

// ==============================================================================
// EXEMPLE 5 : Notification avec priorité élevée
// ==============================================================================

const urgentNotification = {
  to: "DEVICE_FCM_TOKEN",
  notification: {
    title: "⚠️ Action requise",
    body: "Votre paiement nécessite une authentification"
  },
  data: {
    priority: "high",
    route: "/payment/verify",
    paymentId: "pay_xyz123"
  },
  priority: "high", // Firebase Cloud Messaging priority
  content_available: true
};

// ==============================================================================
// EXEMPLE 6 : Notification multilingue (avec fallback)
// ==============================================================================

const multilingualNotification = {
  to: "DEVICE_FCM_TOKEN",
  notification: {
    title: "New Order", // Fallback en anglais
    body: "You have received a new order"
  },
  data: {
    title_fr: "Nouvelle commande",
    body_fr: "Vous avez reçu une nouvelle commande",
    title_es: "Nuevo pedido",
    body_es: "Ha recibido un nuevo pedido",
    orderId: "12345"
  }
};

// ==============================================================================
// EXEMPLE 7 : Notification pour plusieurs appareils (topic)
// ==============================================================================

const topicNotification = {
  to: "/topics/all_users", // Au lieu d'un token spécifique
  notification: {
    title: "Nouvelle fonctionnalité !",
    body: "Découvrez notre nouveau système de chat en temps réel"
  },
  data: {
    feature: "chat",
    version: "2.1.0"
  }
};

// ==============================================================================
// EXEMPLE COMPLET : Fonction Node.js pour envoyer une notification
// ==============================================================================

/**
 * Envoie une notification push via Firebase Cloud Messaging
 * @param {string} fcmToken - Le token FCM de l'appareil
 * @param {object} notificationData - Les données de la notification
 */
async function sendPushNotification(fcmToken, notificationData) {
  const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY; // Votre clé serveur Firebase
  
  const payload = {
    to: fcmToken,
    notification: {
      title: notificationData.title,
      body: notificationData.body,
      badge: notificationData.badge?.toString(),
      sound: notificationData.sound || "default"
    },
    data: notificationData.data || {},
    priority: "high",
    content_available: true
  };

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success === 1) {
      console.log('✅ Notification envoyée avec succès:', result);
      return { success: true, messageId: result.results[0].message_id };
    } else {
      console.error('❌ Erreur lors de l\'envoi:', result);
      return { success: false, error: result.results[0].error };
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// EXEMPLE D'UTILISATION AVEC FIREBASE ADMIN SDK (Recommandé)
// ==============================================================================

/**
 * Version moderne utilisant Firebase Admin SDK
 * Plus sécurisé et plus facile à utiliser
 */

// npm install firebase-admin

const admin = require('firebase-admin');

// Initialiser Firebase Admin (une seule fois)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

/**
 * Envoie une notification avec Firebase Admin SDK
 */
async function sendPushWithAdminSDK(fcmToken, title, body, data = {}) {
  const message = {
    token: fcmToken,
    notification: {
      title: title,
      body: body
    },
    data: data, // Doit être un objet avec des valeurs string
    apns: {
      payload: {
        aps: {
          badge: data.badge ? parseInt(data.badge) : 0,
          sound: 'default',
          'content-available': 1
        }
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification envoyée:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Erreur:', error);
    return { success: false, error: error.message };
  }
}

// ==============================================================================
// EXEMPLE D'UTILISATION
// ==============================================================================

// Exemple simple
sendPushWithAdminSDK(
  'DEVICE_FCM_TOKEN',
  'Nouvelle commande',
  'Commande #12345 a été créée',
  {
    orderId: '12345',
    route: '/orders/12345',
    badge: '3'
  }
);

// Exemple avec notification multi-appareils
async function notifyAllUsersInTopic(topic, title, body) {
  const message = {
    topic: topic,
    notification: { title, body },
    data: { timestamp: new Date().toISOString() }
  };

  return await admin.messaging().send(message);
}

// ==============================================================================
// TIPS IMPORTANTS
// ==============================================================================

/**
 * 1. Les clés dans 'data' doivent toutes être des strings
 *    ❌ Mauvais : { count: 5 }
 *    ✅ Bon : { count: "5" }
 * 
 * 2. Le payload total ne doit pas dépasser 4KB
 * 
 * 3. Pour iOS, utilisez le champ 'apns' pour des options spécifiques
 * 
 * 4. Pour les notifications silencieuses :
 *    - Utilisez content_available: true
 *    - Ne mettez PAS de champ 'notification'
 *    - Mettez seulement 'data'
 * 
 * 5. Badge :
 *    - Utilisez un nombre pour iOS
 *    - L'app doit réinitialiser le badge manuellement
 * 
 * 6. Sons personnalisés :
 *    - Placez les fichiers .wav ou .caf dans le projet Xcode
 *    - Référencez-les par leur nom : "custom_sound.wav"
 */

// ==============================================================================
// EXPORT
// ==============================================================================

module.exports = {
  sendPushNotification,
  sendPushWithAdminSDK,
  notifyAllUsersInTopic
};
