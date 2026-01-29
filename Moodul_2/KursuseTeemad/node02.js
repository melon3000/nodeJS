console.log(console);

console.log("Midagi tavalist");
console.error("Midagi läks valesti");
console.warn("See on hoiatus");

console.log(__filename);
console.log(__dirname);

const path = require("path");

const fail = path.join(__dirname, "andmed.txt");
console.log(fail);
/*
Object [console] {
  log: [Function: log],
  info: [Function: info],
  debug: [Function: debug],
  warn: [Function: warn],
  error: [Function: error],
  dir: [Function: dir],
  time: [Function: time],
  timeEnd: [Function: timeEnd],
  timeLog: [Function: timeLog],
  trace: [Function: trace],
  assert: [Function: assert],
  clear: [Function: clear],
  count: [Function: count],
  countReset: [Function: countReset],
  group: [Function: group],
  groupEnd: [Function: groupEnd],
  table: [Function: table],
  dirxml: [Function: dirxml],
  groupCollapsed: [Function: groupCollapsed],
  Console: [Function: Console],
  profile: [Function: profile],
  profileEnd: [Function: profileEnd],
  timeStamp: [Function: timeStamp],
  context: [Function: context],
  createTask: [Function: createTask]
}
Midagi tavalist
Midagi läks valesti
See on hoiatus
C:\Users\opilane\Desktop\nodeJS\Moodul_2\node02.js
C:\Users\opilane\Desktop\nodeJS\Moodul_2
C:\Users\opilane\Desktop\nodeJS\Moodul_2\andmed.txt
*/