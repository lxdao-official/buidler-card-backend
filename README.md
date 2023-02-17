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
