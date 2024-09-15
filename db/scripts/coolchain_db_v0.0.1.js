db = db.getSiblingDB('coolchain');

db.createCollection('Measurements');
db.createCollection('Versioning');

db.Versioning.insertOne({
  numeroVersion: '0.0.1',
  dateInstallation: new Date(),
});
