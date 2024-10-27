db = db.getSiblingDB('coolchain');

db.Records.drop();
db.Events.drop();
// db.Devices.drop();


db.createCollection('Records');
db.createCollection('Events');
// db.createCollection('Devices');