// imports
const axios = require('axios');
const sqlite3 = require('sqlite3');
const express = require('express');
const { json } = require('express');

// instantiate database
var db = new sqlite3.Database('/Users/phillipeismark/Documents/SystemIntegration/si_mandatory_assignment_2/Skat/Database/TaxInfoDb.sqlite');

// port
const PORT = 8088;

// create express application
var app = express();

// setup express to use json
app.use(express.json());

// index for testing
app.get('/', (req, res) => {
    console.log('Received request on "/"')
    res.status(200).send({'Response': 'Welcome to SkatAPI, we use JSON here :)'});
});
app.get('/api', (req, res) => {
    console.log('Received request on "/"')
    res.status(200).send({'Response': 'Welcome to SkatAPI, we use JSON here :)'});
});

// create user
app.post('/create-user', (req, res) => {
    console.log('create-user request');
    let data = req.body;
    let query = 'INSERT INTO SkatUser(UserId, CreatedAt, IsActive) VALUES(?,?,?)';
    db.run(query, [data.UserId, data.CreatedAt, data.IsActive], (err) => {
        if (err) {
            res.status(500).send({'Response':'Error creating user, please post UserId, CreatedAt format yyyy-mm-dd, IsActive 0/1'});
        } 
        else {
            res.status(201).send({'Response':'Succes creating user'});
        };
    });
});

// get specific user
app.get('/get-user', (req, res) => {
    let data = req.body;
    let query = 'SELECT * FROM SkatUser WHERE Id = ?';

    db.all(query, [data.Id], (err, result) => {
        if (err) {
            res.status(500).send({'Response':'Error getting user'});
        }
        if (result.length > 0) {
            res.status(200).send({'Response':result});
        } else {
            res.status(400).send({'Response':'Error getting user, does the id exist?'});
        }
    });
});

// update specific user - cant be validated after ES6 since the this.changes object will be null
app.patch('/update-user', (req, res) => {
    console.log('received request on "/update-user"');
    let data = req.body;

    let query = "UPDATE SkatUser SET IsActive = ? WHERE Id = ?";
    db.run(query, [data.isActive, data.id], async function (err) {
        if (err) {
            res.status(500).send({'Response':'Error updating user', err });
        } else if (this.changes >= 1) {
            res.status(200).send({'Response': `Success updating Rows affected: ${this.changes}`});
        } else {
            res.status(400).send({'Response': ` Error updating: Rows affected: ${this.changes}. Try another Id`})
        };
    });
});

//delete specific user
app.delete('/api/delete-user', (req, res) => {
    let data = req.body;

    let query = 'DELETE From SkatUser WHERE Id = ?';
    db.run(query, [data.id], async function (err) {
        if (err) {
            res.status(500).send({"Response":"Error deleting user"});
        } else if (this.changes >= 1) {
            res.status(200).send({"Response": `OK Deleted Rows affected: ${this.changes}`});
        } else {
            res.status(400).send({'Response': ` Error deleting: Rows affected: ${this.changes}. Maybe it's already deleted?`})
        };
    }); 
});

// create SkatYear
app.post('/api/create-skatyear', (req, res) => {
    let data = req.body;
    let query = 'INSERT INTO SkatYear(Label, CreatedAt, ModifiedAt, StartDate, EndDate) VALUES(?,?,?,?,?)';

    db.run(query, [data.Label, data.CreatedAt, data.ModifiedAt, data.StartDate, data.EndDate], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({'Response':'Error creating SkatYear, please post these values: Label, CreatedAt, ModifiedAt, StartDate, EndDate'});
        } else {
            res.status(201).send({'Response':'Succes creating SkatYear'});
        };
    });
});

// get skatyear
app.get('/api/get-skatyear', (req,res) => {
    let data = req.body;

    let query = 'SELECT * FROM SkatYear WHERE Id = ?';
    db.all(query, [data.Id], (err, result) => {
        if (err) {
            res.status(500).send({'Response':'Error getting SkatYear'});
        } else {
            if (result.length > 0) {
                res.status(200).send({'Response':result});
            }
            else {
                res.status(400).send({'Response':'Error, did you post a valid Id?'});
            };
        }
    });
});

// update SkatYear
app.patch('/api/update-skatyear', (req, res) => {
    let data = req.body;
    
    let query = 'UPDATE SkatYear SET Label = ? WHERE Id = ?';
    db.run(query, [data.label, data.id], async function (err) {
        if (err) {
            res.status(500).send({'Response':'Error updating SkatYear, please post a label and id'});
        } else if (this.changes >= 1) {
            res.status(200).send({'Response': `Success updating SkatYear, Rows affected: ${this.changes}`});
        } else {
            res.status(400).send({'Response': `Error updating, Rows affected: ${this.changes}`})
        };
    });
});

// delete skatYear
app.delete('/api/delete-skatyear', (req, res) => {
    let data = req.body;

    let query = 'DELETE From SkatYear WHERE Id = ?';
    db.run(query, [data.Id], async function (err) {
        if (err) {
            res.status(500).send({"Response":"Error deleting SkatYear please make sure the id exists."});
        } else if (this.changes >= 1) {
            res.status(200).send({"Response": `Success deleting SkatYear, Rows affected: ${this.changes}`});
        } else {
            res.status(400).send({'Response': `Error deleting, Rows affected: ${this.changes}, maybe you already deleted it?`})
        };
    }); 
});

// create skatUserYear takes SkatUserId, SkatYearId, UserId, IsPaid, Amount
app.post('/api/create-skatUserYear', (req, res) => {
    let data = req.body;
    let id = data.Id;
    let skatUserId = data.SkatUserId;
    let skatYearId = data.SkatYearId;
    let userId = data.UserId;
    let isPaid = data.IsPaid;
    let amount = data.Amount;

    let query = "INSERT INTO SkatUserYear VALUES (?, ?, ?, ?, ?, ?)";

    if (amount <= 0) {
        res.status(400).send({"Response":"Bad request. Amount must be above 0"});
    } else {
        db.run(query, [id,skatUserId,skatYearId,userId,isPaid,amount], async function (err) {
            if (err) {
                res.status(500).send({"Response":"Error creating SkatUserYear, maybe the id already exists?"});
            } else if (this.changes >= 1) {
                res.status(201).send({"Response":`Succesfully created SkatUserYear Rows affected: ${this.changes}`});
            } else {
                res.status(400).send({"Response":`Error creating SkatUserYear Rows affected: ${this.changes}`});
            }
        })
    }
})

// pay-taxes
app.post('/api/pay-taxes', (req, res) => {
    let data = req.body;
    let amount = data.Amount;
    let id = data.UserId;
    
    // verify valid amount
    if (amount <= 0) {
        res.status(400).send({"Response":"Invalid request: amount must be over 0"});

    // Check if unpaid taxyears. 
    } else {
        let query = 'Select * from SkatUserYear WHERE IsPaid = 0 and UserId = ?';
        db.all(query, [id], (err, results) => {
            if (err) {
                res.status(500).send({"Response":"Error checking earlier tax years"});
                console.log(err);
            } else {
                switch (results.length) {
                    case 0:
                        console.log('found zero unpaid taxyears');
                    break;
                    default:
                        console.log('found unpaid taxyears');
                    break;
                }
            }
        });

        // Request Skat_Tax_Calculator 
        axios.post('http://localhost:7071/api/Skat_Tax_Calculator', {
            money: amount
        })
        .then((response) => {
            let taxAmount = String(response.data.tax_money);    
            let query = "UPDATE SkatUserYear SET IsPaid = 1, Amount = ? WHERE UserId = ?";   
            db.run(query,[taxAmount, id], (err) => {
                if (err) {
                    console.log('ERROR updating SkatYear: ', err);
                } else {
                    console.log('SkatYear updated to paid');
                };
            });
            
            // Request bank/withdraw-money
            axios.post('http://localhost:5005/api/bank/withdraw-money', { 
                data: {
                    BankUserId: id,
                    Amount: taxAmount
                }
            }) 
            .then((response) => {
                console.log('success deducting from account');
                res.status(200).send({"Response":"Taxes sucessfully paid. The amount has been deducted from your account"});
            })
            .catch(function (error) {
                res.status(400).send({"Response":"Error paying taxes, are you sure the BankUserId is correct?"});
            })
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).send({"Response":"Error paying taxes"});
        })
    }   
});

// start sever on port
app.listen(PORT, (err) => {
    if (err) {
        console.log('There was an error starting the server: ', err);
        return;
    } else {
        console.log('Listening on port: ', PORT);
    }
});