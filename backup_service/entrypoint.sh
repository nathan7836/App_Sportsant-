#!/bin/sh

# Configuration
# BACKUP_INTERVAL in seconds (3600 = 1 hour)
BACKUP_INTERVAL=3600
# KEEP_DAYS determines how long to keep backups
KEEP_DAYS=14
DATA_SOURCE="/data/dev.db"
BACKUP_DIR="/backups"

echo "🚀 Démarrage du service de sauvegarde automatique..."
echo "📂 Source: $DATA_SOURCE"
echo "📂 Destination: $BACKUP_DIR"
echo "⏱ Intervalle: $BACKUP_INTERVAL secondes"

# Ensure backup dir exists
mkdir -p "$BACKUP_DIR"

while true; do
  DATE=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/auto_backup_$DATE.sqlite"

  echo "------------------------------------------------"
  echo "⏰ [$(date)] Lancement de la sauvegarde..."

  if [ -f "$DATA_SOURCE" ]; then
    # Use sqlite3 .backup command for safe hot backup (works even if DB is locked/in-use)
    # This copies the DB consistent state to the file
    sqlite3 "$DATA_SOURCE" ".backup '$BACKUP_FILE'"
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
      echo "✅ Sauvegarde réussie : $BACKUP_FILE"
      SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
      echo "📊 Taille : $SIZE"
      
      # Cleanup old backups
      echo "🧹 Nettoyage des sauvegardes datant de plus de $KEEP_DAYS jours..."
      find "$BACKUP_DIR" -name "auto_backup_*.sqlite" -mtime +$KEEP_DAYS -delete
      
    else
      echo "❌ ERREUR lors de la sauvegarde (Code: $EXIT_CODE)"
    fi
  else
    echo "⚠️ Source introuvable : $DATA_SOURCE"
  fi

  echo "💤 Pause de $BACKUP_INTERVAL secondes..."
  sleep $BACKUP_INTERVAL
done
