db = db.getSiblingDB('coolchain');

db.createCollection('Devices');

db.createCollection('Auditors');

db.Versions.insertOne({
  versionNumber: '0.0.3',
  installationDate: new Date(),
});
