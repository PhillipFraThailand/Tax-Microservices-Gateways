
const express = require('express');
const db = require('mysql');
const PORT = 5005;
var app = express();
app.use(express.json());
const axios = require('axios')

//CRUD Account
const read_amount_account = "SELECT amount FROM BankBorger.account WHERE BankUserId = ?";
const update_deduct_amount_account = "UPDATE BankBorger.account SET Amount = ? - ?  WHERE ? = ?";

//Done

app.post('/api/bank/withdraw_money', async (req, res) => {
    let amount = req.body.amount;
    let bankUserId = req.body.bankUserId;

    const getAmount = "SELECT Amount FROM account WHERE BankUserId = ?";
    con.query(getAmount, [bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request: ");

        } else {
            let substractAmount = amount - results[0];
            const putNewAmount = "UPDATE account SET Amount = ? WHERE BankUserId = ?";
            con.query(putNewAmount, [substractAmount, bankUserId], async (err, results) => {
                if (err){
                    res.status(500).send("Bad Request: ");

                } else {
                    res.status(200).send({"Results": "Final", results});
                }
            });
        }
    });
});

app.post('/api/BankBorger/add_deposit', async (req, res) => {
    let incomingAmount = req.body.amount;
    let bankerUserId = req.body.bankUserId;
    if (incomingAmount > 0) {
        axios({
            method: 'post',
            url: 'http://localhost:7071/api/interestRate',
            data: {
                amount: req.body.amount
            }
        })
            .then(response => {
                let getCurrentTime = new Date().toISOString().slice(0, 10);
                let amount = response.data;
                let finalAmount = amount.replace(',', ".")
                const update_add_amount_account = "UPDATE BankBorger.account SET Amount = Amount + ?  WHERE BankUserId = ?";
                con.query(update_add_amount_account, [finalAmount, bankerUserId], async (err) => {
                    if (err) {
                        res.status(500).send("Bad Request");
                    } else {
                        const createDeposit_account = "INSERT INTO BankBorger.deposit (BankUserId, CreateAt, Amount) VALUES (?,?,?)";
                        con.query(createDeposit_account, [bankerUserId, getCurrentTime, finalAmount], async (err) => {
                            if (err) {
                                console.log({ "Response": "What we get ", bankerUserId, getCurrentTime, finalAmount })
                                res.status(500).send("Bad Request deposit:")
                            } else {
                                res.status(200).send({ "Response": 'Success: ' + bankerUserId + " " + getCurrentTime + " " + finalAmount });
                            }
                        })
                    }
                });
            }
            )
    }
});

//Done
app.get('/api/BankBorger/list_deposit', async (req, res) => {
    let bankUserId = req.body.bankUserId;
    console.log(bankUserId);
    const read_deposit = "SELECT bankUserId, CreateAt, Amount FROM BankBorger.deposit WHERE BankUserId = ?";

    con.query(read_deposit, [bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad request");
        } else {
            res.status(200).send({ "Response: ": "Success: ", results });
        }
    });
});
//TODO TEST THIS ONE WHEN TOGETHER WITH PHILLIP
app.get('/api/BankBorger/create_loan', async (req, res) => {
    let bankUserId = req.body.bankUserId;
    let loanAmount = req.body.loanAmount;
    con.query(read_amount_account, [bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request");
        } else {
            console.log(results);
            let totalAmount = results[0].amount;
            axios({
                method: 'post',
                url: 'http://localhost:7072/api/Loan-Algo-Function',
                data: {
                    accountAmount: totalAmount,
                    loanAmount: loanAmount
                }
            })
                .then(response => {
                    response.data
                    if (response.status < 400) {
                        let getCurrentTime = new Date().toISOString().slice(0, 10);
                        const createLoan_query = "INSERT INTO BankBorger.loan (Userid, CreateAt, ModifiedAt, Amount) VALUES (?, ?, ? ,?)";
                        con.query(createLoan_query, [bankUserId, getCurrentTime, getCurrentTime, loanAmount], async (err) => {
                            if (err) {
                                res.status(500).send("Bad Request");
                            } else {
                                res.status(200).send("Inserted into loan");
                            }
                        });
                    } else {
                        res.status(500).send("Bad Request received");
                    }
                });
        }
    });
});
//DONE
app.post('/api/BankBorger/pay_loan', async (req, res) => {
    let bankUserId = req.body.bankUserId;
    let loanId = req.body.loanId;
    const read_loan = "SELECT amount FROM BankBorger.loan WHERE Id = ? AND Userid = ?";
    con.query(read_loan, [loanId, bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request: can't find database");
        } else {

            let loanAmount = results[0].amount;
            con.query(read_amount_account, [bankUserId], async (err, results) => {
                if (err) {
                    res.status(500).send("Bad Request: can't find database");
                } else {

                    let accountAmount = results[0].amount;
                    let calcResult = accountAmount - loanAmount;
                    if (calcResult >= 0) {
                        const change_account_amount = "UPDATE account SET Amount = ? WHERE BankUserId = ?";
                        con.query(change_account_amount, [calcResult, bankUserId], async (err, results) => {
                            if (err) {
                                res.status(500).send("Bad Request: ");
                            } else {
                                res.status(200).send("Money paid to loan: "
                                    + " Loan amount " + loanAmount + "inserted amount: " + accountAmount + " Missing: " + calcResult + "New account balance: ");
                            }
                        });
                    } else {
                        res.status(500).send("Bad Request: " + loanAmount + " is greater than what you have in your account: " + accountAmount)
                    }
                }
            });
        }
    })
});
app.get('/api/BankBorger/list_loans', async (req, res) => {
    const list_of_unpaid_loans = "SELECT Userid, CreateAt, ModifiedAt, Amount FROM loan WHERE Amount > 0 AND Userid = ?";
    let bankUserId = req.body.bankUserId;
    con.query(list_of_unpaid_loans, [bankUserId], async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request: ");
        } else {

            res.status(200).send({ "Results": "Final", results });
        }
    });
});

//TODO MISSING
app.post('/api/BankBorger/withdrawl_money', async (req, res) => {

});
app.post('/add_account', async (req, res) => {
    let id = req.body.id;
    let bankUserId = req.body.bankUserId;
    let isStudent = req.body.isStudent;
    let createAt = req.body.createAt;
    let modifiedAt = req.body.ModifiedAt;
    let interestRate = req.body.interestRate;
    let amount = req.body.amount;
    let accountNo = req.body.accountNo;
    const insert_into_account = "INSERT INTO  BankBorger.account (id, BankUserId, AccountNo, IsStudent, CreateAt, ModfiedAt, InterestRate, Amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    con.query(insert_into_account, [id, bankUserId, accountNo, isStudent, createAt, modifiedAt, interestRate, amount], async (err) => {
        if (err) throw err;
        res.status(200).send("inserted:");
    });
});
app.get('/api/BankBorger/read_account', async (req, res) => {
    const readquery_account = "SELECT id, BankUserId,IsStudent, CreateAt, ModfiedAt, InterestRate, Amount FROM BankBorger.account";

    con.query(readquery_account, async (err, results, fields) => {
        if (err) throw err;
        console.log(results);
        res.status(200).send({ "response": "Data set fetched: ", results });
    });
});
app.post('/add_amount', async (req, res) => {

});
app.post('/api/BankBorger/update_account', async (req, res) => {
    let where = req.body.where;
    let change = req.body.change;
    let id_find = req.body.id_find;
    console.log(where + " " + change + " " + id_find)
    const updatequery_account = "UPDATE account SET ModfiedAt = ?  WHERE BankUserId =  ?";

    con.query(updatequery_account, [change, id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")
        } else {
            res.status(200).send("changed the follow: " + id_find + " to " + change);
        }
    });
});
app.post('/api/BankBorger/delete_account', async (req, res) => {
    let id_find = req.body.id_find;
    const deletequery_account = "DELETE FROM BankBorger.account WHERE BankUserId = ?";
    con.query(deletequery_account, [id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")
        } else {
            res.status(200).send("Deleted id: " + req.body.id_find);
        }
    });
});

//CRUD BankUser
app.post('/api/BankBorger/add_bankUser', async (req, res) => {
    let userid = req.body.userId;
    let createAt = req.body.CreateAt;
    let modifiedAt = req.body.ModifiedAt;
    const createquery_bankUser = "INSERT INTO  BankBorger.bankuser (Userid, CreateAt, ModifiedAt) VALUES  (?, ?, ?)";
    con.query(createquery_bankUser, [userid, createAt, modifiedAt], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")

        } else {
            res.status(200).send("inserted: " + userid + " " + createAt)
        }
    });
});
app.get('/api/BankBorger/read_bankUser', async (req, res) => {
    const readquery_bankUser = "SELECT id, Userid, CreateAt, ModifiedAt FROM BankBorger.bankuser";
    con.query(readquery_bankUser, async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request")

        } else {
            res.status(200).send({ "Data set fetched: \n": "Resutls", results });
        }
    });
});
app.post('/api/BankBorger/update_bankUser', async (req, res) => {
    let change = req.body.change;
    let id_find = req.body.id_find;
    const updatequery_bankUser = "UPDATE BankBorger.bankuser SET CreateAt = ?  WHERE id =  ?";
    con.query(updatequery_bankUser, [change, id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")
        }
        res.status(200).send("changed the follow: " + id_find + " to " + change);
    });
});
app.post('/api/BankBorger/delete_bankUser', async (req, res) => {

    let id_find = req.body.id_find;
    const deletequery_bankUser = "DELETE FROM BankBorger.bankuser WHERE UserId = ?";
    con.query(deletequery_bankUser, [id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")

        } else {
            res.status(200).send("Deleted id: " + req.body.id_find);
        }
    });
});
//DB Connection
const con = db.createConnection({
    host: "localhost",
    user: "root",
    password: "fedefrede1",
    database: "BankBorger"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected");
});
//?Main?
app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("listening on port: " + PORT)
    }
});