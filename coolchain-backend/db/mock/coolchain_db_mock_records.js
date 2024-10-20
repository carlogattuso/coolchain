db = db.getSiblingDB('coolchain');

db.Auditors.insertOne({
  _id: '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b',
});

db.Devices.insertOne({
  _id: '0xb2ba63cfc976FbE6CeFbf81076100eAfC1456627',
  name: 'Test Raspberry Pi',
  auditorAddress: '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b',
});

db.Devices.insertOne({
  _id: '0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0',
  name: 'Test Raspberry Pi II',
  auditorAddress: '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b',
});

db.Auditors.insertOne({
  _id: '0xCd9D32e877aDeaAef02B179a8EDE69c289A68968',
});

db.Devices.insertOne({
  _id: '0xb57Ba9aD7D81610D4410c91b2F80EbEE580484CB',
  name: 'Test Raspberry Pi Alpha',
  auditorAddress: '0xCd9D32e877aDeaAef02B179a8EDE69c289A68968',
});
