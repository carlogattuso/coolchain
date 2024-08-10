db = db.getSiblingDB('coolchain');

db.createCollection('temperature');
db.createCollection('versioning');

db.temperature.insertMany([
  {
    sensorId: BigInt(1),
    timestamp: new Date(),
    value: 2,
  },
  {
    sensorId: BigInt(1),
    timestamp: new Date(),
    value: 5,
  },
  {
    sensorId: BigInt(2),
    timestamp: new Date(),
    value: 1,
  },
  {
    sensorId: BigInt(1),
    timestamp: new Date(),
    value: 2,
  },
  {
    sensorId: BigInt(2),
    timestamp: new Date(),
    value: 6,
  },
]);

db.versioning.insertOne({
  numeroVersion: '0.0.1',
  dateInstallation: new Date(),
});
