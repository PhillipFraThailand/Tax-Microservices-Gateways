# Tax-Microservices-Gateways
A tax system built with microservices connected by an ocelote gateway

# HTTP Calls through Ocelote

## SkatAPI

localhost:5000/get-skatuser
{
	"Id":"3"
}

localhost:5000/create-skatUserYear
{
	"Id":"16",
	"SkatUserId":"14", 
	"SkatYearId":"14",
	"UserId":"14",
	"IsPaid":"yes",
	"Amount":"12345"
}

localhost:5000/update-skatuser
{
	"isActive":"yes",
	"id":"1"
}

localhost:5000/delete-user
{
	"id":"12"
}

localhost:5000/get-skatyear
{
	"Id":"2"
}

localhost:5000/delete-skatyear
{
	"Id":"16"
}
  
localhost:5000/update-skatyear
  {
	"label":"NewerLAbel",
	"id":"2"
}

http://localhost:5000/pay-taxes
{
	"UserId":"6",
	"Amount":"10"
}


localhost:5000/create-skatyear
{
	"Label":"Morning",
	"CreatedAt":"1000-01-01",
	"ModifiedAt":"1000-01-01",
	"StartDate":"1000-01-01",
	"EndDate":"9999-01-01"
}

localhost:5000/create-skatuser
{
	"UserId":"10",
	"CreatedAt":"2020-11-12",
	"IsActive":"1"
}


## Bank
http://localhost:5000/bank/read-account 

http://localhost:5000/bank/update-account
{
    "change": 2,
    "BankUserId": 25,
    "where": "IsStudent"
}

http://localhost:5000/bank/list-loans
{
	"bankUserId":"1"
}

http://localhost:5000/bank/pay-loan
{
	"LoanId": "7",
	"BankUserId": "6",
	"Amount": "50"
}

localhost:5000/bank/withdraw-money
{ 
	"data": {
		"BankUserId":"2",
		"Amount":"10"
	}
}

http://localhost:5000/bank/create-loan
{
	"BankUserId": "6",
	"Amount": "20000"
}

http://localhost:5000/bank/list-deposit
{
	"BankUserId": "1"
}

http://localhost:5000/bank/add-deposit
{
	"BankUserId": "1",
	"Amount": "100"
}

http://localhost:5000/bank/add-amount
{
	"Amount": 1,
	"BankUserId": "1"
}

http://localhost:5000/bank/add-account
{
	"BankUserId": "6",
	"AccountNo": "6",
	"IsStudent": "1",
	"CreatedAt": "1995-12-12",
	"ModifiedAt": "1995-12-12",
	"InterestRate": "0.1",
	"Amount": "100000"
}

localhost:5000/bank/add_deposit
{
	"bankUserId": "2",
	"amount": "100000.10"
}

## BorgerUser
http://localhost:5000/borger/update-borgeruser
{
"Change": "1111-12-12",
"Where": "CreatedAt",
"UserId": 3
}

http://localhost:5000/borger/add-borgeruser
{
	"UserId": "3",
	"CreatedAt": "12-12-1995"
}

http://localhost:5000/borger/read-borgeruser

http://localhost:5000/borger/get-borgeruser-by-id
{
	"id":"7"
}

http://localhost:5000/borger/delete-borgeruser
{
	"UserId": "2"
}

## Borger Adress
localhost:5000/borger/read-borger-address

localhost:5000/borger/get-address-by-id
{
	"id":"1"
}

localhost:5000/borger/add-address
{
	"BorgerUserId":"1",
	"CreatedAt":"9999-01-01",
	"IsValid":"1"
}

localhost:5000/borger/delete-address
{
	"BorgerUserId":"2"
}

localhost:5000/borger/update-address
{
	"Change":"2",
	"Where":"CreatedAt",
	"BorgerUserId":"1123"
}

## Functions without Ocelote
http://localhost:7073/api/Interest-Rate-Function
{
	"amount":"1000.52"
}

localhost:7071/api/Skat_Tax_Calculator
{
	"money":1000
}


http://localhost:7072/api/Loan-Algo-Function
{
	"accountAmount":"10000",
	"loanAmount":"500"
}


















