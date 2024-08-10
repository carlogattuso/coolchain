db = db.getSiblingDB('coolchain');

db.createUser({
  user: 'admin',
  pwd: 'coolchain',
  roles: [
    {
      role: 'readWrite',
      db: 'coolchain',
    },
  ],
});
