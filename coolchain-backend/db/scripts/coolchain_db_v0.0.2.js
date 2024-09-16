db = db.getSiblingDB('coolchain');

db.createCollection('Events');

db.Versions.insertOne({
  versionNumber: '0.0.2',
  installationDate: new Date(),
});
