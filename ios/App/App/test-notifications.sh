#!/bin/bash

# Script de test des notifications Firebase
# Ce script vous guide à travers les étapes de vérification

echo "🔔 ===== TEST DES NOTIFICATIONS FIREBASE ====="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Étape 1: Vérification des fichiers de configuration${NC}"
echo "----------------------------------------"

# Vérifier GoogleService-Info.plist
if [ -f "ios/App/App/GoogleService-Info.plist" ]; then
    echo -e "${GREEN}✅ GoogleService-Info.plist trouvé${NC}"
else
    echo -e "${RED}❌ GoogleService-Info.plist MANQUANT${NC}"
    echo "   → Téléchargez-le depuis Firebase Console"
    echo "   → Placez-le dans ios/App/App/"
fi

# Vérifier AppDelegate.swift
if grep -q "FirebaseApp.configure()" "ios/App/App/AppDelegate.swift" 2>/dev/null; then
    echo -e "${GREEN}✅ Firebase configuré dans AppDelegate${NC}"
else
    echo -e "${RED}❌ Firebase non configuré dans AppDelegate${NC}"
fi

# Vérifier MessagingDelegate
if grep -q "MessagingDelegate" "ios/App/App/AppDelegate.swift" 2>/dev/null; then
    echo -e "${GREEN}✅ MessagingDelegate implémenté${NC}"
else
    echo -e "${YELLOW}⚠️  MessagingDelegate non trouvé${NC}"
fi

echo ""
echo -e "${BLUE}Étape 2: Vérification de la configuration Capacitor${NC}"
echo "----------------------------------------"

# Vérifier package.json
if grep -q "@capacitor/push-notifications" "package.json" 2>/dev/null; then
    echo -e "${GREEN}✅ Plugin Push Notifications installé${NC}"
else
    echo -e "${RED}❌ Plugin Push Notifications MANQUANT${NC}"
    echo "   → Exécutez: npm install @capacitor/push-notifications"
fi

# Vérifier capacitor.config
if [ -f "capacitor.config.ts" ] || [ -f "capacitor.config.json" ]; then
    echo -e "${GREEN}✅ Fichier de configuration Capacitor trouvé${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier de configuration Capacitor non trouvé${NC}"
fi

echo ""
echo -e "${BLUE}Étape 3: Instructions pour tester${NC}"
echo "----------------------------------------"
echo ""
echo "1. Lancez l'application sur un APPAREIL PHYSIQUE (pas simulateur)"
echo "   → Connectez votre iPhone/iPad"
echo "   → Dans Xcode: Product → Destination → Votre appareil"
echo "   → Product → Run (Cmd+R)"
echo ""
echo "2. Vérifiez les logs dans Xcode (Cmd+Shift+Y)"
echo "   → Recherchez: '📱 Firebase FCM Token'"
echo "   → Copiez le token affiché"
echo ""
echo "3. Testez depuis Firebase Console"
echo "   → Ouvrez: https://console.firebase.google.com"
echo "   → Cloud Messaging → 'Envoyer votre premier message'"
echo "   → Cliquez sur 'Envoyer un message de test'"
echo "   → Collez le token FCM"
echo "   → Cliquez sur 'Tester'"
echo ""

echo -e "${BLUE}Étape 4: Commandes curl pour tester${NC}"
echo "----------------------------------------"
echo ""
echo "Copiez cette commande et remplacez les valeurs:"
echo ""
echo -e "${YELLOW}curl -X POST https://fcm.googleapis.com/fcm/send \\"
echo "  -H \"Authorization: key=VOTRE_SERVER_KEY\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"to\": \"VOTRE_TOKEN_FCM\","
echo "    \"notification\": {"
echo "      \"title\": \"Test Notification\","
echo "      \"body\": \"Ceci est un test\""
echo "    },"
echo "    \"data\": {"
echo "      \"test\": \"true\""
echo "    }"
echo "  }'${NC}"
echo ""

echo -e "${BLUE}Étape 5: Checklist de dépannage${NC}"
echo "----------------------------------------"
echo ""
echo "Si les notifications ne fonctionnent pas, vérifiez :"
echo ""
echo "□ L'app tourne sur un appareil PHYSIQUE (pas simulateur)"
echo "□ Les permissions de notification sont accordées"
echo "□ Le certificat APNs est valide dans Firebase Console"
echo "□ Capabilities → Push Notifications est activé dans Xcode"
echo "□ Background Modes → Remote notifications est activé"
echo "□ GoogleService-Info.plist correspond au bon projet Firebase"
echo "□ Le token FCM est bien reçu (vérifiez les logs)"
echo "□ L'appareil a une connexion internet active"
echo "□ Firebase Cloud Messaging est activé dans votre projet"
echo ""

echo -e "${GREEN}===== FIN DES VÉRIFICATIONS =====${NC}"
echo ""
echo "Pour plus d'aide, consultez :"
echo "  → DIAGNOSTIC-COMPLET.md"
echo "  → FIREBASE-NOTIFICATIONS-GUIDE.md"
echo ""

# Fonction pour extraire les infos de GoogleService-Info.plist
extract_firebase_info() {
    if [ -f "ios/App/App/GoogleService-Info.plist" ]; then
        echo ""
        echo -e "${BLUE}Informations Firebase détectées :${NC}"
        echo "----------------------------------------"
        
        # Extraire PROJECT_ID
        PROJECT_ID=$(grep -A 1 "PROJECT_ID" "ios/App/App/GoogleService-Info.plist" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
        if [ ! -z "$PROJECT_ID" ]; then
            echo "Project ID: $PROJECT_ID"
        fi
        
        # Extraire BUNDLE_ID
        BUNDLE_ID=$(grep -A 1 "BUNDLE_ID" "ios/App/App/GoogleService-Info.plist" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
        if [ ! -z "$BUNDLE_ID" ]; then
            echo "Bundle ID: $BUNDLE_ID"
        fi
        
        echo ""
    fi
}

extract_firebase_info

echo "Besoin d'aide ? Ouvrez un issue sur GitHub ou consultez la documentation Firebase."
echo ""
