const express = require('express');
const http = (require('http'))
const PORT = 5004;
const sqlite3 = require('sqlite3');
var app = express();
app.use(express.json());

var db = new sqlite3.Database('/Users/phillipeismark/Documents/SystemIntegration/si_mandatory_assignment_2/Borger/borgerDb.sqlite');

app.get('/api/borger/read-borger-address', async (req, res) => {
    const query = "SELECT BorgerUserId, CreatedAt, IsValid FROM address";
    db.all(query, async (err, results) => {
        if (err) {
            res.status(500).send({"Response":"DB error"});
        } else if (results.length > 0) {
            res.status(200).send({ "Response": "Success: ", results});
        } else {
            res.status(400).send({"Bad Request": "No results"});
        }               
    });
});

app.get('/api/borger/get-borgerAddress-by-id', (req,res) => {
    let data = req.body;
    let id = data.id;

    let query = "SELECT BorgerUserId, CreatedAt, IsValid FROM address WHERE Id = ?";
    db.all(query, [id], async function (err, result) {
        if (err) {
            res.status(500).send({"Bad Request": "Internal error"});
        } else if (result.length > 0) {
            res.status(200).send({ "Success:":"Response", result});
        } else {
            res.status(400).send({"Bad Request": "No results, please post a valid id"});
        }
    });
});

app.post('/api/borger/add-address', async (req, res) => {
    let borgerUserId = req.body.BorgerUserId;
    let createAt = req.body.CreatedAt;
    let isValid = req.body.IsValid;

    const query = "INSERT INTO  address (BorgerUserId, CreatedAt, IsValid) VALUES (?, ?, ?)";
    db.run(query, [borgerUserId, createAt, isValid], async (err) => {
        if (err) {
            res.status(500).send({"Bad Request": "Unable to add into address table please post these values: BorgerUserId, CreatedAt, IsValid"});
        } else {
            res.status(200).send({"inserted: ": borgerUserId , createAt, isValid});
        }
    });
});

app.patch('/api/borger/update-address', async (req, res) => {
    let change = req.body.Change;
    let where = req.body.Where;
    let borgerUserId = req.body.BorgerUserId;

    switch (where){
        case "CreatedAt":
            const queryCreatedAt = "UPDATE address SET CreatedAt = ?  WHERE BorgerUserId =  ?";
            db.run(queryCreatedAt, [change, borgerUserId], async function (err) {
                if (err) {
                    res.status(500).send({"Response":" ERROR Cannot update: "+where+" for user "+borgerUserId});
                } else if (this.changes >= 1) {
                    res.status(200).send({"changed the follow:":"Updated " +where+ " To "+ change});
                } else {
                    res.status(400).send({"Bad Request":"Are you sure the Id exists?"});
                }
            });
        break;
        case "IsValid":
            const queryIsValid = "UPDATE address SET IsValid = ? WHERE BorgerUserId = ?";
            db.run(queryIsValid, [change, borgerUserId], async (err) => {
                if (err) {
                    res.status(500).send({"Bad Request":"Cannot update: "+where+" for user "+borgerUserId});
                } else if (this.changes >= 1) {
                    res.status(200).send({"changed the follow:":"Updated " +where+ " To "+ change});
                } else {
                    res.status(400).send({"Bad Request":"Are you sure the Id exists?"});
                }
            });
        break;
        default:
            res.status(500).send({"Response": "Bad request Cannot update column. Update works on 'CreatedAt' and 'IsValid'"});
        break;
    }
});

app.delete('/api/borger/delete-address', async (req, res) => {
    let borgerUserId = req.body.BorgerUserId;
    const query = "DELETE FROM address WHERE BorgerUserId = ?";
    db.run(query, [borgerUserId], async function (err) {
        if (err) {
            res.status(500).send({"Bad Request": "Could not delete from the database"});
        } else if (this.changes >= 1) {
            res.status(200).send({"Deleted id": borgerUserId});
        } else {
            res.status(400).send({"Bad Request":"Are you sure the borgerUserId exists? Maybe its already been deleted"});
        }
    });
});

/*
BORGER USER CRUD
 */
app.post('/api/borger/add-borgeruser', async (req, res) => {
    let userId = req.body.UserId;
    let createdAt = req.body.CreatedAt;
    const query = "INSERT INTO  borgerUser (UserId, CreatedAt) VALUES (?, ?)";
    db.run(query, [userId, createdAt], async (err) => {
        if (err) {
            res.status(500).send({"Bad Request": "Cannot add borgerUser, please post UserId and CreatedAt"});
        } else {
            res.status(200).send({"inserted: ": userId, createdAt});
        }
    });
});

app.get('/api/borger/read-borgeruser', async (req, res) => {
    const query = "SELECT UserId, CreatedAt FROM borgerUser";
    db.all(query, async (err, results, fields) => {
        if (err) {
            res.status(500).send({"Bad Request": "Unable to reach database"});
        } else {
            res.status(200).send({ "Data set fetched: ": "Response", results });
        }
    });
});

app.get('/api/borger/get-borgerUser-by-id', (req,res) => {
    let data = req.body;
    let id = data.id;

    let query = "SELECT * FROM borgerUser WHERE id = ?";
    db.all(query, [id], async function (err, result) {
        if (err) {
            res.status(500).send({"Response":"Internal error"});
        } else if (result.length > 0) {
            res.status(200).send({ "Success:":"Response", result});
        } else {
            res.status(400).send({"Response":"Bad request: Are you sure the id exists?"});
        }
    });
});

app.patch('/api/borger/update-borgeruser', async (req, res) => {
    let change = req.body.Change;
    let where = req.body.Where;
    let userId = req.body.UserId;

    console.log(change, where, userId)
    switch (where) {
        case "CreatedAt":
            const queryCreatedAt = "UPDATE borgerUser SET CreatedAt = ?  WHERE UserId =  ?";
            db.run(queryCreatedAt, [change, userId], async function (err) {
                if (err) {
                    res.status(500).send({"Bad Request":"Cannot update: "+where+" for user "+userId});
                } else if (this.changes >= 1) {
                    res.status(200).send({"changed the follow:":"Updated " +where+ " To "+ change});
                } else {
                    res.status(400).send({"Bad Request":"Are you sure the Id exists?"});
                }
            });
        break;
        case "UserId":
            const queryUserId = "UPDATE borgerUser SET UserId = ?  WHERE UserId =  ?";
            db.run(queryUserId, [change, userId], async (err) => {
                if (err) {
                    res.status(500).send({"Bad Request":"Cannot update: "+where+" for user "+userId});
                } else if (this.changes >= 1) {
                    res.status(200).send({"changed the follow:":"Updated " +where+ " To "+ change});
                } else {
                    res.status(400).send({"Bad Request":"Are you sure the Id exists?"});
                }
            });
        break;
        default:
            res.status(500).send({"Response": "Bad request Cannot update column. Update works on 'UserId' and 'CreatedAt'"});
        break;
    }
});

app.delete('/api/borger/delete-borgeruser', async (req, res) => {
    let userId = req.body.UserId;
    const query = "DELETE FROM borgerUser WHERE UserId = ?";
    db.run(query, [userId], async function (err) {
        if (err) {
            res.status(500).send({"Bad Request": "Cannot delete borguser"});
        } else if (this.changes >= 1) {
            res.status(200).send({"OK DELETED:":"Deleted id: ", userId});
        } else {
            res.status(400).send({"Bad Request":"Are you posting the correct values? Should be 'UserId':'3' or maybe the id is already deleted"});
        }
    });
});

app.use(express.urlencoded({ extended: true }))
app.listen(PORT, (err) => {

    if (err) {
        console.log(err)
    } else {
        console.log("listening on port: " + PORT)
    }
});

