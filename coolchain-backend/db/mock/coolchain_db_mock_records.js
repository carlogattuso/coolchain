db = db.getSiblingDB('coolchain');

db.Auditors.insertOne({
  _id: '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b',
});

db.Devices.insertOne({
  _id: '0xb2ba63cfc976FbE6CeFbf81076100eAfC1456627',
  name: 'Test Raspberry Pi',
  auditorAddress: '0xcd9d32e877adeaaef02b179a8ede69c289a68968',
});

db.Devices.insertOne({
  _id: '0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0',
  name: 'Test Raspberry Pi II',
  auditorAddress: '0xcd9d32e877adeaaef02b179a8ede69c289a68968',
});

db.Auditors.insertOne({
  _id: '0xcd9d32e877adeaaef02b179a8ede69c289a68968',
});

db.Devices.insertOne({
  _id: '0xb57Ba9aD7D81610D4410c91b2F80EbEE580484CB',
  name: 'Test Raspberry Pi Alpha',
  auditorAddress: '0xCd9D32e877aDeaAef02B179a8EDE69c289A68968',
});

db.Devices.insertOne({
  _id: '0x3DEC0316F5BBA61493dbAeAa09FE11332CFb2421',
  name: 'Test Raspberry Pi Alpha II',
  auditorAddress: '0xcd9d32e877adeaaef02b179a8ede69c289a68968',
});

db.Devices.insertOne({
  _id: '0x2488A7C8EaAf95150D19473Ee3e49B70b6D71A38',
  name: 'Test Raspberry Pi Alpha IIaI',
  auditorAddress: '0xcd9d32e877adeaaef02b179a8ede69c289a68968',
});

db.Devices.insertOne({
  _id: '0x6254f14E829F80a4df176a130cc2D0285A1F1871',
  name: 'Test Raspberry Pi Alpha III',
  auditorAddress: '0xcd9d32e877adeaaef02b179a8ede69c289a68968',
});

db.Devices.insertOne({
  _id: '0x654Bb5d17A83BC0658aD96105AA9bEa9E7a4C304',
  name: 'Test Raspberry Pi Alpha III',
  auditorAddress: '0xcd9d32e877adeaaef02b179a8ede69c289a68968',
});
