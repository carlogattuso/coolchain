mkdir -p ~/mongodb/rs0-0 ~/mongodb/rs0-1 ~/mongodb/rs0-2
mongod --replSet rs0 --port 27017 --dbpath ~/mongodb/rs0-0 --bind_ip localhost --fork --logpath ~/mongodb/rs0-0/mongod.log
mongod --replSet rs0 --port 27018 --dbpath ~/mongodb/rs0-1 --bind_ip localhost --fork --logpath ~/mongodb/rs0-1/mongod.log
mongod --replSet rs0 --port 27019 --dbpath ~/mongodb/rs0-2 --bind_ip localhost --fork --logpath ~/mongodb/rs0-2/mongod.log
mongosh ./scripts/coolchain_db_start.js
read -r -p "Press any key to continue"