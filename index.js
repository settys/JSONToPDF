var express = require("express");
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var Controller = require("./controllers/apiCallHandlers");


var defaultConfig = {
  port: 3000,
};

var assetsFolder = "";

var main = function () {
  assetsFolder = path.join(__dirname, "assets");
  var htmlTemplatesFolder = path.join(assetsFolder,"htmlTemplates")
  var imagesFolder = path.join(assetsFolder,"images")
  var config = getConfiguration();

  Controller.setHtmlTemplatesFolder(htmlTemplatesFolder);
  Controller.setImagesFolder(imagesFolder);


  var app = express();
  app.use(express.json());
  app.post("/generatePDF", Controller.generatePDF);
  app.listen(config.port, () => {
    console.log(
      `server is started and is being served from http://localhost:${config.port}`
    );
  });

};

var getConfiguration = function () {
  var configFilePath = path.join(assetsFolder, "config.json");
  if (!fs.existsSync(configFilePath)) {
    return defaultConfig;
  }
  var configDataFromFile = JSON.parse(fs.readFileSync(configFilePath) + "");
  var configData = _.merge(defaultConfig, configDataFromFile);
  return configData;
};

main();
