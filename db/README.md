# Database Installation

Follow these steps to setup the MongoDB local database environment

## Windows

### Installation

1. [Install MongoDB client](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/#install-mongodb-community-edition-on-windows)
2. Add `yourPathToMongoDB\MongoDB\Server\yourVersion\bin` to PATH environment variable

> [!IMPORTANT]
>
> When installing MongoDB, make sure to check that the database does not start as a service. To verify this, you need to
> go to the Windows Services and disable/deactivate it.
>
>`MongoDB Database Server (MongoDB)`

### Initialisation

1. Create replica set

```bash
  Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Hidden -Command `"mongod.exe --replSet rs0 --dbpath 'yourPathToCoolchain\coolchain\db\data' --port 27017 --bind_ip_all`""
```

> [!TIP]
>
> To shutdown the current MongoDB process, you can use these two commands
>
>```bash
>  Get-Process mongod
>  Stop-Process -Name mongod
>```

2. [Install MongoDB Shell](https://www.mongodb.com/try/download/shell)
3. Initiate replica set transactions

```bash
  mongosh --port 27017
  rs.initiate()
```

4. Execute database initialisation scripts

```bash
  .\yourPathToCoolchain\coolchain\db\data\coolchain_db_seed.sh
```

5. Generate prisma scheme

```bash
  cd yourPathToCoolchain\coolchain\db
  prisma generate
```

## Linux