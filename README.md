## Instructions:

1. extract project from zip file
2. You must have docker installed and run on root project directoy "docker-compose up --build -V" then you docker create images for you
3. For the manual start of project you shoulld have download mongodb , rabitMQ etc on local and add urls in env(optional setup with docker everything working fine)
4. "yarn install" for packages install

# here are endpoints

1. http://localhost:3000/api/invoice POST

   {
   "customer": "Test Customer 4",
   "reference": "3A123",
   "amount": 500,
   "items": [{ "sku": "item1", "qt": 4 } , { "sku": "item1", "qt": 2 }]
   }

2. http://localhost:3000/api/invoice/{id} GET

3. http://localhost:3000/api/invoice/list GET

# For Test Cases run:

yarn test

# For Test lint run:

yarn lint

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
