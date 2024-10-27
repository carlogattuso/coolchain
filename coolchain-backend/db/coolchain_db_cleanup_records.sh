mkdir -p ./data/rs0-0 ./data/rs0-1 ./data/rs0-2
mongod --replSet rs0 --port 27017 --dbpath ./data/rs0-0 --bind_ip localhost --fork --logpath ./data/rs0-0/mongod.log
mongod --replSet rs0 --port 27018 --dbpath ./data/rs0-1 --bind_ip localhost --fork --logpath ./data/rs0-1/mongod.log
mongod --replSet rs0 --port 27019 --dbpath ./data/rs0-2 --bind_ip localhost --fork --logpath ./data/rs0-2/mongod.log
mongosh ./scripts/coolchain_db_start.js
read -r -p "Press any key to continue"