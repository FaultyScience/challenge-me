const axios = require("axios");
const fs = require("fs");

async function getData() {

  try {

    let url = "https://ddragon.leagueoflegends.com/api/versions.json";
    let res = await axios.get(url);

    const version = res.data[0];
    url = "http://ddragon.leagueoflegends.com/cdn/" + version + "/data/en_US/champion.json";
    res = await axios.get(url);

    const champJson = res.data.data;
    const champToIdMap = {};
    const idToChampMap = {};
    const idToPrintChampMap = {};

    for (let champ of Object.values(champJson)) {

      champToIdMap[champ.name.toUpperCase()] = Number(champ.key);
      idToChampMap[Number(champ.key)] = champ.name.toUpperCase();
      idToPrintChampMap[Number(champ.key)] = champ.name;
    }

    fs.writeFile("./maps/champToIdMap.json",
      JSON.stringify(champToIdMap), err => {
        if (err) { console.log(err); }
    });

    fs.writeFile("./maps/idToChampMap.json",
      JSON.stringify(idToChampMap), err => {
        if (err) { console.log(err); }
    });

    fs.writeFile("./maps/idToPrintChampMap.json",
      JSON.stringify(idToPrintChampMap), err => {
        if (err) { console.log(err); }
    });
  }

  catch (err) {
    console.log("Error:", err.message);
  }
}

// retrieve and generate champ maps from riot every 5 minutes
async function generateChampMaps() {

  try {

    await getData();
    setTimeout(generateChampMaps, 300000);
  }

  catch (err) {
    console.log("Error:", err.message);
  }
}

module.exports = generateChampMaps;
