// phillip eismark
// imports
const axios = require('axios');
const sqlite3 = require('sqlite3');
const express = require('express');

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
            console.log(err);
            res.status(500).send({'Response':'Error creating user'});
        } 
        else {
            res.status(201).send({'Response':'Succes creating user'});
        };
    });
});

// get specific user
app.get('/get-user', (req, res) => {
    console.log('received request on "/get-user"');
    let data = req.body;
    let query = 'SELECT * FROM SkatUser WHERE Id = ?';
    db.get(query, [data.Id], (err, user) => {
        if (err) {
            console.log(err);
            res.status(500).send({'Response':'Error getting user'});
        } 
            else {
            res.status(200).send({'Response':user});
        };
    });
});

// update specific user
app.patch('/update-user', (req, res) => {
    console.log('received request on "/update-user"');
    let data = req.body;
    let query = "UPDATE SkatUser SET IsActive = ? WHERE Id = ?";
    db.run(query, [data.Value, data.Identifier], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({'Response':'Error updating user'});
        } else {
            res.status(200).send({'Response': 'Success updating'});
        };
    });
});

//delete specific user
app.delete('/api/delete-user', (req, res) => {
    console.log('received request on "/delete-user"');
    let data = req.body;
    let query = 'DELETE From SkatUser WHERE Id = ?';
    db.run(query, [data.Id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({"Response":"Error deleting user"});
        } else {
            res.status(200).send({"Response": "OK Deleted"});
        };
    }); 
});

// create SkatYear
app.post('/api/create-skatyear', (req, res) => {
    console.log('received request on "/create-skatyear"');
    let data = req.body;
    let query = 'INSERT INTO SkatYear(Label, CreatedAt, ModifiedAt, StartDate, EndDate) VALUES(?,?,?,?,?)';
    db.run(query, [data.Label, data.CreatedAt, data.ModifiedAt, data.StartDate, data.EndDate], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({'Response':'Error creating SkatYear'});
        } 
        else {
            res.status(201).send({'Response':'Succes creating SkatYear'});
        };
    });
});

// get skatyear
app.get('/api/get-skatyear', (req,res) => {
    console.log('received request on "/get-skatyear"');
    let data = req.body;
    let query = 'SELECT * FROM SkatYear WHERE Id = ?';
    db.get(query, [data.Id], (err, row) => {
        if (err) {
            console.log(err);
            res.status(500).send({'Response':'Error getting SkatYear'});
        } 
        else {
            res.status(200).send({'Response':row});
        };
    });
});

// update specific SkatYear
app.patch('/api/update-skatyear', (req, res) => {
    console.log('received request on "/skatyear"');
    let data = req.body;
    let query = 'UPDATE SkatYear SET Label = ? WHERE ? = ?';
    db.run(query, [data.Value, data.Condition, data.ConditionValue], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({'Response':'Error updating SkatYear'});
        } else {
            res.status(200).send({'Response': 'Success updating SkatYear'});
        };
    });
});

// delete skatYear
app.delete('/api/delete-skatyear', (req, res) => {
    console.log('received request on "/delete-skatyear"');
    let data = req.body;
    let query = 'DELETE From SkatYear WHERE Id = ?';
    db.run(query, [data.Id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({"Response":"Error deleting SkatYear"});
        } else {
            res.status(200).send({"Response": "OK Deleted SkatYear"});
        };
    }); 
});

// TODO: break this into smaller functions.
app.post('/api/pay-taxes', (req, res) => {
    console.log('received request on "/api/pay-taxes"');
    let data = req.body;
    
    // verify valid amount
    if (data.Amount <= 0) {
        console.log('Invalid amount');
        res.status(400).send({"Response":"Invalid Amount must be over 0"});
    } else {
        // look for unpaid taxyears. results.size should be 0 if there are none.
        let query = 'Select * from SkatUserYear WHERE IsPaid = 0 and UserId = ?';
        db.all(query, [data.UserId], (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send({"Response":"Error checking earlier tax years"});
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

        // request Skat_Tax_Calculator function. It takes in float 'money'.
        console.log('Sending axios request to tax-calculater');
        axios.post('http://localhost:7071/api/Skat_Tax_Calculator', {
            money: `${data.money}`
        })
        // catch response and request to deduce the amount from the users account
        .then((response) => {
            console.log('response from Skat_Tax_Calculator: ', response.data);
            let taxResponse = response.data;
            let money = taxResponse.tax_money;

            // if success, update SkatYear to paid.
            if (response.status < 400) {
                let query = "UPDATE SkatUserYear SET IsPaid = 1, Amount = ? WHERE UserId = ?";   
                db.run(query,[taxResponse.tax_money, data.UserId], (err) => {
                    if (err) {
                        console.log('ERROR updating SkatYear: ', err);
                    } else {
                        console.log('Succesfully updated SkatYear');
                    };
                });
                // log for debugging and make a request to deduct the amount from users bank.
                console.log('Updated SkatUserYear: Line 198');
                // axios.post('http://localhost:5001/bank/withdraw_money', { 
                    console.log('line 201', response.data.tax_money)

                axios.post('http://localhost:5005/api/bank/withdraw_money', { 
                    data: {
                        bankUserId: data.UserId,
                        Amount:money
                    }
                })
                .then((response)=> {
                    //if success
                    console.log('line 211 response from bank')
                    if (response.status < 400) {
                        console.log('success deducting from account');
                        res.status(200).send({"Response":"Taxes sucessfully paid. The amount has been deducted from your account"});
                    } else {
                        console.log('Invalid response from bank: ', response.status);
                        res.status(500).send({"Response":"Error paying taxes"});
                    }
                })
                .catch(function (error) {
                    console.log('ERROR LINE 225');
                })
            // if Skat_Tax_Calculator does not give a valid response log it.
            } else { 
                console.log('Invalid response from Skat_Tax_Calculator: ', response.status);
            }
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).send({"Response":"Error paying taxes"});
        })
        // res.status(200).send({"Response":"always runs"});
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