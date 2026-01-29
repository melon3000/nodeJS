const fs = require("fs");

// faili lugemine
fs.readFile("./assets/tekst.txt", "utf-8", (err, data) => {
    if (err) {
        console.log("Viga: " + err);
        return;
    }
    console.log(data);
});

// faili kirjutamine
fs.writeFile("./assets/uustekst.txt", "- - - TEKST - - - ", (err) => {
    if (err) {
        console.log("Viga: " + err);
        return;
    }
    console.log("Fail kirjutatud");
});
