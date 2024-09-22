mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0" ./scripts/coolchain_db_init.js
mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0" ./scripts/coolchain_db_drop_collections.js
mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0" ./scripts/coolchain_db_v0.0.1.js
mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0" ./scripts/coolchain_db_v0.0.2.js
read -r -p "Press any key to continue"