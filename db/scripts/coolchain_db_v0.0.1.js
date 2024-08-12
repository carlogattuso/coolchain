db = db.getSiblingDB('coolchain');

db.createCollection('Temperature');
db.createCollection('Versioning');

db.Versioning.insertOne({
  numeroVersion: '0.0.1',
  dateInstallation: new Date(),
});
