db = db.getSiblingDB('coolchain');

db.Auditors.insertOne({
  _id: '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b',
});

db.Devices.insertOne({
  _id: '0xb2ba63cfc976FbE6CeFbf81076100eAfC1456627',
  name: 'Test Raspberry Pi',
  auditorAddress: '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b',
});

db.Auditors.updateOne(
  { _id: '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b' },
  { $push: { devices: '0xb2ba63cfc976FbE6CeFbf81076100eAfC1456627' } },
);
