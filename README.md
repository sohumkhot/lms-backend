# Loan Management System (Assignment Solution by Sohum Khot)

Designed, Implemented and Hosted a full-stack web application for Loan Management System with the following features:
- Register and Login a new User / Admin (Authentication using JWT)
- Authenticated user should be able to request a Loan with the required amount and loan term (number of weekly installments for repayment)
- Authenticated user should be able to fetch loan details (including current repayment status) by ID or fetch all loans at once
- Authenticated admin should be able to approve a loan
- Authenticated user should be able to repay an approved loan

## Tech Stack Used
- Backend: NodeJS, ExpressJS (Hosted using render.com)
- Database: MongoDB (Hosted using MongoDB Atlas)

## Hosted URLs
- `https://loan-management-system-api.onrender.com/`

### Folder Structure
- server.js: Handles the Server initialization and DB connection setup
- app.js: Initialises Routes and Middleware
- config: Contains the config.env and configuration for establishing the DB connection to MongoDB
- routes: Contains the User and Loan routes
- controllers: Contains the controllers for User and Loan routes
- models: Contains the schemas for User and Loan documents
- middleware: Contains the middleware for catching Async errors and Custom Error Handling
- utils: Contains helper functions


### Backend Installation
- Prerequisite: Install NodeJS from [here](https://nodejs.org/en/download) or you can [install via brew](https://formulae.brew.sh/formula/node) for Mac users

- Create MongoDB Cluster: As we are using MongoDB Transactions in the backend, we need a replica set environment. So to keep the setup simple for now, I've used MongoDB Atlas for hosting a free-tier cluster which provides a replica set by default. Here's the [guide](https://www.mongodb.com/basics/clusters/mongodb-cluster-setup).

- Create a file `config.env` in the config directory as `config/config.env` with the following content:
```
PORT=4000

DB_URI=mongodb+srv://sohumkhot:jd6AjfguQiXZ3MY9@cluster0.owpqlfk.mongodb.net/?retryWrites=true&w=majority

JWT_SECRET=thisismysecret1

JWT_EXPIRE=5d

COOKIE_EXPIRE=5

TEST_ENV_BASE_URL=https://loan-management-system-api.onrender.com
```
Note: This is a functional DB_URI for the cluster that I've hosted using MongoDB. You can use your own DB_URI. There are better solutions like Vault for sharing secrets but I've shared it here for a quicker setup.

- Install the dependencies
```bash
npm install
```

- Run the Server
```bash
npm run start
```

- Now the server should be running locally on `http://localhost:4000`

- Run the Feature Tests
```bash
npm test
```
Currently the tests are set to request the hosted URL. We can point it to local environment by changing the URL in test files.

- Postman Collections
```
Local Postman Collection.json (For using local API)
Staging Postman Collection.json (For using hosted API)
```

### User Routes:
1. `POST /api/v1/register`
- Request Body:
```
{
    "name": string (Name of the User),
    "email": string (Email of the User)
    "password": string (Password of the User)
    "role": string (can be 'user' or 'admin')
}
```
- Response:
```
{
    "success": boolean,
    "user": {
        "name": string,
        "email": string,
        "password": string,
        "role": string,
        "_id": string (System generated ID)
    },
    "token": string (Access token to be set in cookies)
}
```
- Explanation:
This route will be used for registering a user. Error will be thrown if existing email is being used or the schema doesn't match the requirements.
Token is generated using JWT and will be set in cookies of the requests for authentication.


2. `GET /api/v1/login`
- Request Body:
```
{
    "email": string (Email of the User)
    "password": string (Password of the User)
}
```
- Response:
```
{
    "success": boolean,
    "user": {
        "name": string,
        "email": string,
        "password": string,
        "role": string,
        "_id": string (System generated ID)
    },
    "token": string (Access token to be set in cookies)
}
```
- Explanation:
This route will be used for logging-in a user.
Error will be thrown if invalid email or password is being used or the schema doesn't match the requirements.
Token is generated using JWT and will be set in cookies of the requests for authentication.

### Loan Routes:
1. `POST /api/v1/loans/create`
- Request Auth (Cookie):
```
token: string (Access token to be set in cookies)
```
- Request Body:
```
{
    "amount": number (Required Amount),
    "numberOfInstallments": number (Number of weekly installments to repay the loan)
}
```
- Response:
```
{
    "user": string (User ID of the user who requested the loan),
    "amount": number (Required Loan Amount),
    "numberOfInstallments": number,
    "status": string (can be 'pending', 'approved' or 'paid'),
    "installments": [
        {
            "amount": number (Installment amount calculated using LoanAmount / NumberOfInstallments),
            "dueDate": Date (Incremental weekly due date for the installment),
            "status": string (can be 'pending' or 'paid'),
            "_id": string (System generated Installment ID)
        },
        ...
    ],
    "_id": string (System generated Loan ID),
    "createdAt": Date
}
```
- Explanation:
This route will be used by the user to create a loan with required amount and number of weekly installments.
Accordingly, installments will be generated. Error will be thrown if the schema doesn't match the requirements. 

2. `GET /api/v1/loans/:loanId`
- Request Auth (Cookie):
```
token: string (Access token to be set in cookies)
```
- Request Path Param:
```
loanId: string (Valid Loan ID)
```
- Response:
```
{
    "user": string (User ID of the user who requested the loan),
    "amount": number (Required Loan Amount),
    "numberOfInstallments": number,
    "status": string (can be 'pending', 'approved' or 'paid'),
    "installments": [
        {
            "amount": number (Installment amount calculated using LoanAmount / NumberOfInstallments),
            "dueDate": Date (Incremental weekly due date for the installment),
            "status": string (can be 'pending' or 'paid'),
            "_id": string (System generated Installment ID)
        },
        ...
    ],
    "_id": string (System generated Loan ID),
    "createdAt": Date
}
```
- Explanation:
This route will be used for fetching Loan Details using Loan ID.
Error will be thrown if Loan doesn't exist in DB or if the user is not authorized to access the Loan Details or if the schema of the request doesn't match the requirements

3. `GET /api/v1/loans`
- Request Auth (Cookie):
```
token: string (Access token to be set in cookies)
```
- Response:
```
[
    {
        "user": string (User ID of the user who requested the loan),
        "amount": number (Required Loan Amount),
        "numberOfInstallments": number,
        "status": string (can be 'pending', 'approved' or 'paid'),
        "installments": [
            {
                "amount": number (Installment amount calculated using LoanAmount / NumberOfInstallments),
                "dueDate": Date (Incremental weekly due date for the installment),
                "status": string (can be 'pending' or 'paid'),
                "_id": string (System generated Installment ID)
            },
            ...
        ],
        "_id": string (System generated Loan ID),
        "createdAt": Date
    },
    ...
]
```
- Explanation:
This route will be used for fetching Loan Details of all loans for an authenticated user.

4. `PUT /api/v1/loans/:loanId/approve`
- Request Auth (Cookie):
```
token: string (Access token to be set in cookies)
```
- Request Path Param:
```
loanId: string (Valid Loan ID)
```
- Response:
```
{
    "user": string (User ID of the user who requested the loan),
    "amount": number (Required Loan Amount),
    "numberOfInstallments": number,
    "status": string (can be 'pending', 'approved' or 'paid'),
    "installments": [
        {
            "amount": number (Installment amount calculated using LoanAmount / NumberOfInstallments),
            "dueDate": Date (Incremental weekly due date for the installment),
            "status": string (can be 'pending' or 'paid'),
            "_id": string (System generated Installment ID)
        },
        ...
    ],
    "_id": string (System generated Loan ID),
    "createdAt": Date
}
```
- Explanation:
This route will be used only by the admins to approve a requested loan.
Error will be thrown if a normal user tries to approve the loan or the loan details don't exist in the DB.

5. `POST /api/v1/loans/:loanId/repayment`
- Request Auth (Cookie):
```
token: string (Access token to be set in cookies)
```
- Request Path Param:
```
loanId: string (Valid Loan ID)
```
- Request Body:
```
{
    "amount": number (Installment Amount for repayment)
}
```
- Response:
```
{
    "user": string (User ID of the user who requested the loan),
    "amount": number (Required Loan Amount),
    "numberOfInstallments": number,
    "status": string (can be 'pending', 'approved' or 'paid'),
    "installments": [
        {
            "amount": number (Installment amount calculated using LoanAmount / NumberOfInstallments),
            "dueDate": Date (Incremental weekly due date for the installment),
            "status": string (can be 'pending' or 'paid'),
            "_id": string (System generated Installment ID)
        },
        ...
    ],
    "_id": string (System generated Loan ID),
    "createdAt": Date
}
```
- Explanation:
This route will be used only by the authenticated user to repay an approved loan.
It will mark the next due installment as paid. If all the installments are marked paid, the entire loan will be marked as paid.
Error will be thrown if the loan is not approved or if the sent amount is less than the installment amount or if the loan is already paid.
