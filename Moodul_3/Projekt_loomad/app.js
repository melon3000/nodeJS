// app.js
const express = require("express");
const fs = require("fs");
const open = require("open").default;

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

// loe loomad JSON-failist
const loeLoomad = (callback) => {
    fs.readFile("./loomad.json", "utf-8", (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, JSON.parse(data));
    });
};

// Avaleht: viimased 4 lisatud looma
app.get("/", (req, res) => {
    loeLoomad((err, loomad) => {
        if (err) {
            res.status(500).send("Viga: " + err);
            return;
        }
        const viimased4 = loomad.slice(-5);
        res.render("index", { loomad: viimased4 });
    });
});

// Loomad: kõik loomad
app.get("/loomad", (req, res) => {
    loeLoomad((err, loomad) => {
        if (err) {
            res.status(500).send("Viga: " + err);
            return;
        }
        res.render("loomad", { loomad });
    });
});

// Meist
app.get("/meist", (req, res) => {
    res.render("meist");
});

// Kontakt
app.get("/kontakt", (req, res) => {
    res.render("kontakt");
});

// 404 tundmatutele aadressidele + korrektne staatuskood
app.use((req, res) => {
    res.status(404).render("404");
});

app.listen(PORT, () => {
    console.log("Server töötab pordil " + PORT);
    const url = `http://localhost:${PORT}`;
    console.log("> "+url);
    open(url);
});
