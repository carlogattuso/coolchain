db = db.getSiblingDB('coolchain');

db.Records.drop();
db.Events.drop();

db.createCollection('Records');
db.createCollection('Events');
