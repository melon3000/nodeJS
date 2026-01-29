console.log("Tere maailm!");

const tervitus = (nimi) => {
  return "Tere " + nimi;
};

const tervitusLyhike = nimi => "Tere " + nimi;

const nimi = "Mari";
console.log(`Tere ${nimi}!`);

const config = {
  host: "localhost",
  user: "root",
  password: "secret"
};

const { host, user } = config;

const [esimene, teine] = ["a", "b", "c"];

const tervitusDefault = (nimi = "külaline") => {
  console.log(`Tere ${nimi}`);
};

const loeFail = async () => {
  const sisu = await fs.promises.readFile("test.txt", "utf8");
  console.log(sisu);
};

try {
  teeMidagi();
} catch (error) {
  console.error(error.message);
}

/*
Tere maailm!
Tere Mari!
teeMidagi is not defined
*/