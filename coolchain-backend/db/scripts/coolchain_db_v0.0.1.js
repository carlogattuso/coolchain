db = db.getSiblingDB('coolchain');

db.createCollection('Record');
db.createCollection('Version');

db.Version.insertOne({
  versionNumber: '0.0.1',
  installationDate: new Date(),
});
