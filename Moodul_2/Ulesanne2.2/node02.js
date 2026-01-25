const fs = require("fs");
const path = require("path");

const { nimed, rollid } = require("./data.js");

console.log(nimed);
console.log(rollid);

const filePath = path.join(__dirname, "assets", "tekst.txt");
const content = rollid.join("\n");

fs.writeFile(filePath, content, (err) => {
    if (err) {
        console.log("Viga: " + err);
        return;
    }
    console.log("Fail kirjutatud");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
            console.log("Viga: " + err);
            return;
        }
        console.log(data);
    });
});

/*
> [ 'Milan', 'Alex', 'Marko', 'Kati' ]
> [ 'admin', 'user', 'manager', 'guest' ]
> Fail kirjutatud
admin
user
manager
guest
*/