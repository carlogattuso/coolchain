db = db.getSiblingDB('coolchain');

db.createCollection('Records');
db.createCollection('Versions');

db.Versions.insertOne({
  versionNumber: '0.0.1',
  installationDate: new Date(),
});
