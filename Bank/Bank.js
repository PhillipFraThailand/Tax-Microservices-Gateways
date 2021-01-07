const axios = require('axios')
const express = require('express');
const sqlite3 = require('sqlite3');

var db = new sqlite3.Database('/Users/phillipeismark/Documents/SystemIntegration/si_mandatory_assignment_2/Bank/bankDb.sqlite');

const PORT = 5005;

var app = express();

app.use(express.json());


app.get('/', (req, res) => {
    console.log('Received request on "/"')
    res.status(200).send({'Response': 'Welcome to Bank, we use JSON here :)'});
});

app.post('/api/bank/withdraw-money', async (req, res) => {
    console.log('Received request on: "/api/bank/withdraw-money"');
    let data = req.body.data;
    let bankUserId = data.BankUserId
    let amount = data.Amount;
    console.log('test', bankUserId, amount);
    console.log('data', data)

    const query = "SELECT Amount FROM account WHERE BankUserId = ?";
    db.get(query, [bankUserId], async (err, results) => {
        if (err) {
            console.log('line 31 bank', err)
            res.status(500).send("Bad Request: ");
        } else {
            console.log(results)
            if (results === undefined){
                console.log('Could not find user, please try another BankuUserId');
                res.status(400).send({"Response": "User does not exist, please try another BankUser Id"});
            } else {
                console.log('41', results);
                let newAccountBalance = results.Amount - amount;
                console.log(newAccountBalance)
                const query = "UPDATE account SET Amount = ? WHERE BankUserId = ?";
                db.run(query, [newAccountBalance, bankUserId], async (err, results) => {
                    if (err){
                        console.log(err)
                        res.status(500).send({"Restults": "Couldn't insert new account balance please try again"});
                    } else {
                        res.status(200).send({"Results": "Final New account balance", newAccountBalance});
                    }
                });
            }
        }
    });
});

app.post('/api/bank/add-deposit', async (req, res) => {
    let incomingAmount = req.body.Amount;
    let bankerUserId = req.body.BankUserId;
    if (incomingAmount > 0) {
        axios({
            method: 'post',
            url: 'http://localhost:7073/api/Interest-Rate-Function',
            data: {
                amount: req.body.Amount
            }
        })
            .then(response => {
                console.log(response.data);
                let getCurrentTime = new Date().toISOString().slice(0, 10);
                let amount = response.data.interest_amount;
                console.log(amount)
                const query = "UPDATE account SET Amount = Amount + ?  WHERE BankUserId = ?";
                db.run(query, [amount, bankerUserId], async (err) => {
                    if (err) {
                        res.status(500).send("Bad Request");
                    } else {
                        const query = "INSERT INTO deposit (BankUserId, CreatedAt, Amount) VALUES (?,?,?)";
                        db.run(query, [bankerUserId, getCurrentTime, amount], async (err) => {
                            if (err) {
                                console.log({ "Response": "What we get ", bankerUserId, getCurrentTime, amount })
                                res.status(500).send({"Bad Request deposit": "Failed to set new deposit into database"})
                            } else {
                                res.status(200).send({ "Response": 'Success: on bankUser: ' + bankerUserId + " time: " + getCurrentTime + " amount: " + amount });
                            }
                        })
                    }
                });
            }
        )
    }
});

app.get('/api/bank/list-deposit', async (req, res) => {
    let bankUserId = req.body.BankUserId;
    console.log(bankUserId);
    const query = "SELECT BankUserId, CreatedAt, Amount FROM deposit WHERE BankUserId = ?";
    db.get(query, [bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad request");
        } else {
            console.log(results);
            res.status(200).send({ "Response: ": "Success: ", results });
        }
    });
});

app.post('/api/bank/create-loan', async (req, res) => {
    console.log("hitting")
    let bankUserId = req.body.BankUserId;
    let amount = req.body.Amount;
    const query = "SELECT Amount FROM account WHERE BankUserId = ?";
    db.get(query, [bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request");
        } else {
            axios({
                method: 'post',
                url: 'http://localhost:7072/api/Loan-Algo-Function',
                data: {
                    accountAmount: amount,
                    loanAmount: amount
                }
            })
            .then(response => {
                console.log("hitting")
                response.data
                if (response.status < 400) {
                    let getCurrentTime = new Date().toISOString().slice(0, 10);
                    const query = "INSERT INTO loan (BankUserId, CreatedAt, ModifiedAt, Amount) VALUES (?, ?, ? ,?)";
                    db.run(query, [bankUserId, getCurrentTime, getCurrentTime, amount], async (err) => {
                        if (err) {
                            res.status(500).send({"Response cannot insert into database": "Values tried to insert => ", bankUserId, getCurrentTime, getCurrentTime, amount});
                        } else {
                            res.status(200).send({"Inserted into loan":"Values insterted into database => ", bankUserId, getCurrentTime, getCurrentTime, amount });
                        }
                    });
                } else {
                    res.status(500).send("Bad Request received");
                }
            })
            .catch(e => {
                console.log(e);
            });
        }
    });
});

app.post('/api/bank/pay-loan', async (req, res) => {
    let bankUserId = req.body.BankUserId;
    let loanId = req.body.LoanId;
    let amount = req.body.Amount;
    const query = "SELECT Amount FROM loan WHERE BankUserId = ? AND Id = ?";
    db.get(query, [bankUserId, loanId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request: can't find database");
        } else {
            console.log("LOAN AMOUNT " , results)
            let loanAmount = results.Amount;
            const query = "SELECT Amount FROM account WHERE BankUserId = ?"
            db.get(query, [bankUserId], async (err, results) => {
                if (err) {
                    res.status(500).send("Bad Request: can't find database");
                } else if(results.Amount < amount) {
                    res.status(500).send({"Not enough money in account" : "You cannot pay that much to the loan cannot be more than the amount in you account"});
                } else {
                    console.log("ACCOUNT AMOUNT: ", results);
                    let accountAmount = results.Amount;
                    let calcResult = loanAmount - amount;
                    let newAmountToAccount = accountAmount - amount;
                    console.log(newAmountToAccount);
                    console.log("New LOAN AMOUNT", calcResult)
                    const query = "UPDATE account SET Amount = ? WHERE BankUserId = ?";    
                    db.run(query, [newAmountToAccount, bankUserId], async (err, results) => {
                        if(err){
                            res.status(500).send({"Couldn't update account with the new amount": newAmountToAccount});
                        } else {    
                            if (calcResult >= 0) {
                            const query = "UPDATE loan SET Amount = ? WHERE BankUserId = ? AND Id = ?";
                            db.run(query, [calcResult, bankUserId, loanId], async (err, results) => {
                                if (err) {
                                    res.status(500).send({"Bad Request: ": "Cannot update loan amount"});
                                } else {
                                    res.status(200).send({"Money paid to loan: "
                                        : amount , " Loan amount " : loanAmount, "new Balance: ": newAmountToAccount,  
                                        " Missing: ":  calcResult });
                                    }
                                });
                            } 
                        }
                    });
                }
            });
        }
    })
});

app.get('/api/bank/list-loans', async (req, res) => {
    const query = "SELECT BankUserId, CreatedAt, ModifiedAt, Amount FROM loan WHERE Amount > 0 AND BankUserId = ?";
    let bankUserId = req.body.bankUserId;
    db.all(query, [bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send({"Bad Request: ": "Cannot find database"});
        } else {
            res.status(200).send({ "Results": "Final", results });
        }
    });
});

app.post('/api/bank/add-account', async (req, res) => {
    let bankUserId = req.body.BankUserId;
    let accountNo = req.body.AccountNo;
    let isStudent = req.body.IsStudent;
    let createAt = req.body.CreatedAt;
    let modifiedAt = req.body.ModifiedAt;
    let interestRate = req.body.InterestRate;
    let amount = req.body.Amount;
    const query = "INSERT INTO account (BankUserId, AccountNo, IsStudent, CreatedAt, ModifiedAt, InterestRate, Amount) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.run(query, [bankUserId, accountNo, isStudent, createAt, modifiedAt, interestRate, amount], async (err) => {
        if (err) {
            res.status(500).send({'Response':'Error creating account'});
        }
            res.status(200).send({"Response": "added to account ->  ", bankUserId, accountNo, isStudent, createAt, modifiedAt, interestRate, amount});
        
    });
});

app.get('/api/bank/read-account', async (req, res) => {
    const query = "SELECT * FROM account";
    db.get(query, async (err, results) => {
        if (err) {
            res.status(500).send({"Response": "Error reading all accounts"});
        } else {
            res.status(200).send({ "response": "Data set fetched: ", results});
        }
    });
});

app.post('/api/bank/add-amount', async (req, res) => {
    let amount = req.body.Amount;
    let bankUserId = req.body.BankUserId;
    const query = "SELECT Amount FROM account WHERE BankUserId = ?";
    db.get(query, [bankUserId], async (err, results) => {
        if(err) {
            res.status(500).send({"Response": "Cannot get account"});
        } else {
           
            finalAmount = amount + results.Amount;
            const query = "UPDATE account SET AMOUNT = ? WHERE BankUserId =?";
            db.run(query, [finalAmount, bankUserId], async (err, results) => {
                if (err){
                    res.status(500).send({"Response": "Couldn't update account with new amount."});
                } else {
                    res.status(200).send({"Response: new Amount in account": finalAmount});
                }
            })

        }
    });
});

app.post('/api/bank/update-account', async (req, res) => {
    let where = req.body.where;
    let change = req.body.change;
    let bankUserId = req.body.BankUserId;
    let modifiedAt = new Date().toISOString().slice(0, 10);
    switch (where){
        case "IsStudent":
            let queryIsStuendet = "UPDATE account SET IsStudent = ? AND ModifiedAt = ? WHERE BankUserId = ?";
            db.run(queryIsStuendet, [change, modifiedAt, bankUserId], async (err, result) => {
                if (err) {
                    res.status(500).send({"Bad Request":"Cannot update "+where+" for user", bankUserId})
                } else {
                    res.status(200).send({"changed the bankUserId:  ": bankUserId , where, change});
                }         
            })
        break;
        case "InterestRate":
            let queryInterest = "UPDATE account SET InterestRate = ? AND ModifiedAt = ? WHERE BankUserId = ?";
            db.run(queryInterest, [change, modifiedAt, bankUserId], async (err, result) => {
                if (err) {
                    res.status(500).send({"Bad Request":"Cannot update "+where+" for user", bankUserId})
                } else {
                    res.status(200).send({"changed the bankUserId": bankUserId , where, change});
                }
            })
        break;
        case "Amount":
            let queryAmount = "UPDATE account SET Amount = ? AND ModifiedAt = ? WHERE BankUserId = ?";
            db.run(queryAmount, [change, modifiedAt, bankUserId], async (err, result) => {
                if (err) {
                    res.status(500).send({"Bad Request":"Cannot update "+where+" for user", bankUserId});
                } else {
                    res.status(200).send({"changed the bankUserId:  ": bankUserId , where, change});
                }
            })
        break;
        default:
            console.log("deafult");
        break;
    }
   
});

app.post('/api/bank/delete-account', async (req, res) => {
    let bankUserId = req.body.BankUserId;
    const query = "DELETE FROM account WHERE BankUserId = ?";
    db.run(query, [bankUserId], async (err) => {
        if (err) {
            res.status(500).send({"Bad Request": "Cannot connect to database"});
        } else {
            res.status(204).send({"Deleted id":  bankUserId});
        }
    });
});

app.post('/api/bank/add-bankUser', async (req, res) => {
    let userid = req.body.UserId;
    let createAt = req.body.CreatedAt;
    let modifiedAt = new Date().toISOString().slice(0, 10);
    const query = "INSERT INTO  bankuser (UserId, CreatedAt, ModifiedAt) VALUES  (?, ?, ?)";
    db.run(query, [userid, createAt, modifiedAt], async (err) => {
        if (err) {
            res.status(500).send({"Bad Request": "Cannot create bankUser"});
        } else {
            res.status(200).send({"inserted: " :userid, createAt});
        }
    });
});

app.get('/api/bank/read-bankUser', async (req, res) => {
    const query = "SELECT Userid, CreatedAt, ModifiedAt FROM bankuser";
    db.all(query, async (err, results) => {
        if (err) {
            res.status(500).send({"Bad Request": "Cannot get bankUsers"});
        } else {
            res.status(200).send({ "Data set fetched: \n": "Resutls", results });
        }
    });
});

app.post('/api/bank/update-bankUser', async (req, res) => {
    let change = req.body.Change;
    let where  = req.body.Where;
    let bankUserId = req.body.BankUserId;
    let modifiedAt = new Date().toISOString().slice(0, 10);
    switch(where) {
        case "CreatedAt":
            let queryCreatedAt = "UPDATE bankuser SET CreatedAt = ? AND ModifiedAt = ? WHERE UserId =  ?";
            db.run(queryCreatedAt, [change, modifiedAt, bankUserId], async (err) => {
                if (err) {
                    res.status(500).send({"Bad Request": "Cannot change:" + bankUserId + "and set:" + change})
                } else {
                    res.status(200).send({"changed: ": bankUserId, where, change});
                }
            });
        break;
        case "ModifiedAt":
            let queryModifiedAT = "UPDATE bankuser SET ModifiedAt = ? WHERE UserId =  ?";
            db.run(queryModifiedAT, [change, bankUserId], async (err) => {
                if (err) {
                    res.status(500).send({"Bad Request": "Cannot change:" + bankUserId + "and set:" + change});
                } else {
                    res.status(200).send({"changed: ": bankUserId, where, change});
                }
            });
            
        break;
        case "BankUserId":
            let queryBankUserId = "UPDATE bankuser SET UserId = ? AND ModifiedAt = ? WHERE UserId =  ?";
            db.run(queryBankUserId, [change, modifiedAt,bankUserId], async (err) => {
                if (err) {
                    res.status(500).send({"Bad Request": "Cannot change:" + bankUserId + "and set:" + change})
                } else {
                    res.status(200).send({"changed: ": bankUserId, where, change});
                }
            });
        break;
        default:
            res.status(500).send({"Unexpected error": "exceptions are flying wild these days (End of switch update bankUser)"});
        break;
    }
});

app.post('/api/bank/delete-bankuser', async (req, res) => {
    let bankUserId = req.body.bankUserId;
    const query = "DELETE FROM bankuser WHERE UserId = ?";
    db.run(query, [bankUserId], async (err) => {
        if (err) {
            res.status(500).send({"Bad Request":"Cannot Delete User: ", bankUserId});
        } else {
            res.status(204).send({"Deleted id: ": bankUserId});
        }
    });
});

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("listening on port: " + PORT)
    }
});