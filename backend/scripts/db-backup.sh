#!/bin/bash

# MongoDB Backup Script Wrapper
# This script helps avoid shell interpretation issues with parameters

# Display help message
show_help() {
  echo "MongoDB Database Backup/Restore Utility"
  echo ""
  echo "Usage:"
  echo "  ./db-backup.sh backup [host] [port] [database] [username] [password]"
  echo "  ./db-backup.sh restore [backup-file] [host] [port] [database] [username] [password]"
  echo "  ./db-backup.sh list"
  echo ""
  echo "Examples:"
  echo "  ./db-backup.sh backup                                 # Local backup with defaults"
  echo "  ./db-backup.sh backup 192.168.1.82 27017 baby-tracker # Remote backup without auth"
  echo "  ./db-backup.sh backup 192.168.1.82 27017 baby-tracker admin password123 # With auth"
  echo "  ./db-backup.sh restore ./backups/baby-tracker-2025-04-07-123456.gz # Local restore"
  echo ""
}

# Check if we have at least one argument
if [ $# -lt 1 ]; then
  show_help
  exit 1
fi

# Get operation from first argument
OPERATION=$1
shift

# Execute the Node.js script with arguments
if [ "$OPERATION" = "backup" ]; then
  node "$(dirname "$0")/db-manager.js" backup "$@"
elif [ "$OPERATION" = "restore" ]; then
  node "$(dirname "$0")/db-manager.js" restore "$@"
elif [ "$OPERATION" = "list" ]; then
  node "$(dirname "$0")/db-manager.js" list
else
  echo "Unknown operation: $OPERATION"
  show_help
  exit 1
fi 