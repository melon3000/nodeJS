// V    äljastab terminali teksti “Node.js töötab”
console.log("Node.js töötab");

// jooksva faili täistee
console.log("Faili täistee:", __filename);

// kausta tee, kus fail asub
console.log("Kausta tee:", __dirname);

// protsessi käivitamise argumentide massiiv
console.log("Protsessi argumendid:", process.argv);

/*
> Node.js töötab
> Faili täistee: C:\Users\milan\Desktop\node\Moodul_2\Ulesanne2.1\node01.js
> Kausta tee: C:\Users\milan\Desktop\node\Moodul_2\Ulesanne2.1
> Protsessi argumendid: [
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\milan\\Desktop\\node\\Moodul_2\\Ulesanne2.1\\node01.js'
]
*/