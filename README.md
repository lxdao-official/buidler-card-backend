# Buidler Card

Buidler Card is an open-source project that has been ported from LXDAO DAO Tools for building the Network State.

This is the Backend and Contract repo, for the Website and project details, please go to <https://github.com/lxdao-official/buidler-card-website>.

## How to start the application?

### Prerequisite

- Docker for starting PostgreSQL on your local environment, or a remote PostgreSQL DB

### Start the Database

Install [Docker](https://docs.docker.com/get-docker/) first, and run the following command:

```
cd service/ && docker-compose up -d
```

After that, you will have a local PostgreSQL DB. The connection string is: `DATABASE_URL="postgresql://lxdao:lxdao@localhost:5331/lxdao?schema=public"`.

### Start the Backend

Create `.env` file based on the `.env.sample` file, and you can use the following env values.

```
DATABASE_URL="postgresql://lxdao:lxdao@localhost:5331/lxdao?schema=public"
JWT_SECRET="lxdao"
NFT_STORAGE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1YzlmRWIzOGYzMjQwZTJBQTVjNTE0Yjg1QTdBQTAzNmQxQ2JhOUYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3NjYyNzcwNzcwMSwibmFtZSI6InRlcyJ9.BgHRCj8rhUU19p39HFUdFQ1PtnG6fRhZ6Oe6TUdZsrI"

# THIS ACCOUNT IS FOR TESTING. PLEASE DO NOT USE IT
# THIS IS THE CONTRACT OWNER OF 0x58B5800d8c891073b782d5a9ca81b1b34cdcf2D8
SIGNER_WALLET_PRIVATE_KEY="dd32b4e96930bc8edf0998c496134de1d99c13346eb8b076b199630ef963752b"
```

Then run the following commands to setup the project:

```
npm install
npm run generate
npm run migrate:dev
```

You need to add a buidl in the "Buidler" table with "Onboarding Committee" role through DBMS for testing.

Start the Backend service:

```
npm run start:dev
```

## What is LXDAO?

This is a project build in LXDAO. More links: [LXDAO](https://lxdao.io/) | [LXDAO Forum](https://forum.lxdao.io/) | [LXDAO Discord](https://discord.lxdao.io) | [LXDAO Twitter](https://twitter.com/LXDAO_Official).

LXDAO is an R&D-focused DAO in Web3. Our mission is: To bring together buidlers to buidl and maintain valuable projects for Web3, in a sustainable manner.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

Deploy.

## Installation

```bash
npm install
npm run generate
```

## Start services

```
cd service && docker-compose up -d
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Create a buidler

1. The builder must be in the Onboarding Committee, and send an request:

```
curl --location --request POST 'https://api.lxdao.io/buidler' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..J2IqQKu5z_AP9hXVYco5_CL4p62LkBKdCIpMj-dSFoU' \
--header 'Content-Type: application/json' \
--data-raw '{
    "address": "0x3fC62bDd61BE65E57b112A6676d70450873004e9"
}'
```

https://lxdao.io/buidlers/0x3fC62bDd61BE65E57b112A6676d70450873004e9

2. Set the roles on DB and trigger IPFS update API

### Create the first buidler

1. Create the buidler in DB with the address, and set the status to `ACTIVE`, set role to `{Buidler, "Onboarding Committee"}`, set nounce to an random string.
2. Connect wallet on the website, sign in and get the access token from the local storage. Update profile and generate IPFS.
3. Go to builder profile page and update profile and update status to `PENDING`.
4. Mint.

### Create a project

```
curl --location --request POST 'https://lxdao-backend-preview.herokuapp.com/project' \
--header 'Authorization: Bearer YOUR TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "number": "PROJECT NUMBER",
    "name": "PROJECT NAME",
    "startedAt": "TODO OPTIONAL"
}'
```

### Update data and trigger upload IPFS manually

```
curl --location --request POST 'https://api.lxdao.io/buidler/0x86DBe1f56dC3053b26522de1B38289E39AFCF884/uploadIPFS' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..J2IqQKu5z_AP9hXVYco5_CL4p62LkBKdCIpMj-dSFoU' \
--header 'Content-Type: application/json'
```

.
