mongosh --port 27017 --eval "db.adminCommand({ shutdown: 1 })"
mongosh --port 27018 --eval "db.adminCommand({ shutdown: 1 })"
mongosh --port 27019 --eval "db.adminCommand({ shutdown: 1 })"
