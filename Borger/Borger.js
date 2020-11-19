//steffen giessing
const express = require('express');
const db = require('mysql');
const http = (require('http'))
const PORT = 5004;
var app = express();
app.use(express.json());

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
/*
ADDRESS CRUD
 */
app.get('/api/borger/read_borger_address_table', async (req, res) => {
    const readquery_address = "SELECT id, BorgerUserId, CreatedAt, IsValid FROM BankBorger.address";
    con.query(readquery_address, async (err, results) => {
        if (err) {
            res.status(500).send("Bad Request")
        }
        res.status(200).send({ "Response": "Data set fetched: ", results });
    });
});

app.post('/api/borger/add_address', async (req, res) => {
    let id = req.body.id;
    let borgerUserId = req.body.BorgerUserId;
    let createAt = req.body.CreatedAt;
    let isValid = req.body.IsValid;
    const createquery_address = "INSERT INTO  address (id, BorgerUserId, CreatedAt, IsValid) VALUES (?, ?, ?, ?)";
    con.query(createquery_address, [id, borgerUserId, createAt, isValid], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")
        } else {
            res.status(200).send("inserted: " + id + " " + borgerUserId + " " + createAt + " " + isValid)
        }
    });
});

app.post('/api/borger/update_address', async (req, res) => {
    let change = req.body.change;
    let id_find = req.body.id_find;
    const updatequery_address = "UPDATE address SET CreatedAt = ?  WHERE BorgerUserId =  ?";
    con.query(updatequery_address, [change, id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")

        } else {
            res.status(200).send("changed the follow: ID: " + id_find + " Created At: To " + change);
        }
    });
});

app.post('/api/borger/delete_address', async (req, res) => {

    let id_find = req.body.id_find;
    const deletequery_address = "DELETE FROM address WHERE BorgerUserId = ?";
    con.query(deletequery_address, [id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")
        } else {
            res.status(200).send("Deleted id: " + id_find);
        }
    });
});

/*
BORGER USER CRUD
 */
app.post('/api/borger/add_borgeruser', async (req, res) => {
    let id = req.body.id;
    let userid = req.body.UserId;
    let createAt = req.body.createAt;
    const createquery_borgeruser = "INSERT INTO  borgeruser (id, Userid, CreateAt) VALUES (?, ?, ?)";

    con.query(createquery_borgeruser, [id, userid, createAt], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")
        } else {
            res.status(200).send("inserted: " + userid + " " + createAt)
        }
    });
});

app.get('/api/borger/read_borgeruser', async (req, res) => {
    const readquery_borgeruser = "SELECT id, Userid, CreateAt FROM borgeruser";

    con.query(readquery_borgeruser, async (err, results, fields) => {
        if (err) {
            res.status(500).send("Bad Request")

        } else {
            console.log(results);
            res.status(200).send({ "Data set fetched: ": "Response", results });
        }
    });
});

app.post('/api/borger/update_borgeruser', async (req, res) => {
    let change = req.body.change;
    let id_find = req.body.id_find;
    const updatequery_borgeruser = "UPDATE borgeruser SET CreateAt = ?  WHERE id =  ?";

    con.query(updatequery_borgeruser, [change, id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")

        } else {
            res.status(200).send("changed the follow: " + id_find + " to " + change);
        }
    });
});

app.post('/api/borger/delete_borgeruser', async (req, res) => {

    let id_find = req.body.id_find;

    const deletequery_borgeruser = "DELETE FROM borgeruser WHERE Userid = ?";
    con.query(deletequery_borgeruser, [id_find], async (err) => {
        if (err) {
            res.status(500).send("Bad Request")

        } else {
            res.status(200).send("Deleted id: " + req.body.id_find);
        }
    });
});
app.use(express.urlencoded({ extended: true }))
//?Main?
app.listen(PORT, (err) => {

    if (err) {
        console.log(err)
    } else {
        console.log("listening on port: " + PORT)
    }
});

