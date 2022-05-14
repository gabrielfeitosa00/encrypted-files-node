const express = require("express");
const fs = require("fs");
const https = require("https");
const fileUpload = require("express-fileupload");
const app = express();
app.use(fileUpload());
var config = require("./config.json");
https
  .createServer(
    {
      key: fs.readFileSync(config.httpsKey),
      cert: fs.readFileSync(config.httpsCert),
    },
    app
  )
  .listen(config.portHTTPS);


 //Upload page (GET)
app.get("/upload.html", function (req, res) {
    res.sendFile(__dirname + "/upload.html");
  });
  
  //Dafault page loaded
  app.get("/", function (req, res) {
    res.sendFile(__dirname + "/upload.html");
  });
  
  
  //Upload request (POST) to save the encrypted file
  app.post("/upload.html", function (req, res) {
    //Check if the request contain a file to save, if not raise a server error
    if (!req.files) return res.status(400).send("No files were uploaded.");
  
    //Retrieve the uploaded file
    let uploadedFile = req.files.cryptFile;
    //Generate a file id with a nonce to avoid collision
    const fileName = Date.now() + Math.trunc(Math.random() * 100);
    // Use the mv() method to place the file in the file directory
    uploadedFile.mv(config.storageFolder + fileName, function (err) {
      //If error occur during save process, raise a server error
      if (err) {
        return res.status(500).send(err);
      }
      //return the file id
      res.send(fileName.toString());
    });
  });
  
  //Download page (Generate)
  app.get("/download.html", function (req, res) {
    res.sendFile(__dirname + "/download.html");
  });
  
  //Check file id format and return the requested file
  app.get("/:id([0-9]{13}$)$", function (req, res) {
    res.sendFile(__dirname + "/" + config.storageFolder + req.params.id);
  });

  app.listen(config.portHTTP, function () {
    console.log(
      "Servidor sendo executado na porta " +
        config.portHTTP +
        " e " +
        config.portHTTPS +
        " !"
    );
  });