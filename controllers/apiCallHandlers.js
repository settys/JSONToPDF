var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var mime = require("mime");
var puppeteer = require("puppeteer");
var htmlToPdf = require("html-pdf");

var htmlTemplatesFolder = undefined;
function setHtmlTemplatesFolder(fldr) {
  htmlTemplatesFolder = fldr;
}

var imagesFolder = undefined;
function setImagesFolder(fldr) {
  imagesFolder = fldr;
}
function generatePDF(request, response) {
  var inputData = request.body;

  var templateToUse = inputData.templateToUse || "template1";
  var htmlContent = generateHtml(templateToUse, inputData.resumeData || {});
  var onPDFComplete = function (pdfFileCreated) {
    response.send(`${pdfFileCreated} created.`);
  };
  // createPDFUsingPuppeteer(htmlContent, "resume.pdf", onPDFComplete);
  createPDFUsingHtmlToPdf(htmlContent, "resume2.pdf", onPDFComplete);
 
}

async function createPDFUsingHtmlToPdf(htmlContent, pdfFileName, cb) {
  var options = { format: "Letter" };

  htmlToPdf
    .create(htmlContent, options)
    .toFile(pdfFileName, function (err, res) {
      if (err) return console.log(err);
      cb(pdfFileName);
      // console.log(res); // { filename: '/app/businesscard.pdf' }
    });
}
async function createPDFUsingPuppeteer(htmlContent, pdfFileName, cb) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // We set the page content as the generated html by handlebars
  await page.setContent(htmlContent);

  // we Use pdf function to generate the pdf in the same folder as this file.
  await page.pdf({ path: pdfFileName, format: "A4" });

  await browser.close();
  cb(pdfFileName);
}

function generateHtml(templateToUse, resumeData) {
  var mainHtml = getFileContent(templateToUse, "Main.html");
  var fileDetailsForSubstitution = [
    "Header.html",
    "ContactDetails.html",
    "ResumeDetails.html",
    "Footer.html",
  ];
  for (var fileIndex in fileDetailsForSubstitution) {
    var fileNameWithDetail = fileDetailsForSubstitution[fileIndex];
    var fileContents = "";
    switch (fileNameWithDetail) {
      case "Footer.html":
        var footerDetail = buildDetail(
          templateToUse,
          "footer/footerDetail.html",
          resumeData["FooterDetails"] || []
        );
        fileContents = getFileContent(templateToUse, "footer/footerMain.html");
        fileContents = fileContents
          .split(`<!-- footerDetail.html -->`)
          .join(footerDetail);
        break;
      case "ResumeDetails.html":
        fileContents = getFileContent(templateToUse, fileNameWithDetail);

        var resumeDetails = resumeData["ResumeDetails"] || [];
        for (var rI in resumeDetails) {
          var resumeDetail = resumeDetails[rI];
          var listDetail = "details/listDetail.html";
          var listTitle = "details/listTitle.html";
          if (resumeDetail.Type == "nonlist") {
            listDetail = "details/nonListDetail.html";
            listTitle = "details/nonListTitle.html";
          }
          var resumeDetailList = buildDetail(
            templateToUse,
            listDetail,
            resumeDetail["Details"] || []
          );
          var resumeDetailTitle = getFileContent(templateToUse, listTitle);
          for (var rdf in resumeDetail) {
            var rdv = resumeDetail[rdf];
            resumeDetailTitle = resumeDetailTitle
              .split(`{{ ${rdf} }}`)
              .join(rdv);
          }
          var resumeDetailConstructed = resumeDetailTitle
            .split(`{{ DETAIL }}`)
            .join(resumeDetailList);

          var fsc = fileContents.split(`<!-- ${resumeDetail.Title} -->`);
          fileContents = fsc.join(resumeDetailConstructed);
        }
        break;
      default:
        fileContents = getFileContent(templateToUse, fileNameWithDetail);
        break;
    }

    for (var resumeField in resumeData) {
      var resumeFieldData = resumeData[resumeField];
      if (resumeField == "ProfileImage") {
        var imageFullPath = path.join(imagesFolder, resumeFieldData);
        if (fs.existsSync(imageFullPath)) {
          var mimeType = mime.getType(imageFullPath);
          var imageData = fs.readFileSync(imageFullPath, "base64");
          resumeFieldData = `data:${mimeType};base64,${imageData}`;  
        }
      }
      fileContents = fileContents
        .split(`{{ ${resumeField} }}`)
        .join(resumeFieldData);
    }

    mainHtml = mainHtml
      .split(`<!-- ${fileNameWithDetail} -->`)
      .join(fileContents);
  }

  return mainHtml;
}

function buildDetail(templateToUse, templateFileName, cDataList) {
  var cDetail = getFileContent(templateToUse, templateFileName);
  var cDetailBuilt = "";
  for (var cIndex in cDataList) {
    var cData = cDataList[cIndex];
    var cDetailInWork = cDetail;
    for (var fd in cData) {
      var fdV = cData[fd];
      cDetailInWork = cDetailInWork.split(`{{ ${fd} }}`).join(fdV);
    }
    cDetailBuilt = cDetailBuilt + cDetailInWork;
  }
  return cDetailBuilt;
}
function getFileContent(templateToUse, fileName) {
  var fileContent = "";
  var fileNameWithFullPath = path.join(htmlTemplatesFolder, templateToUse);
  fileNameWithFullPath = path.join(fileNameWithFullPath, fileName);
  if (fs.existsSync(fileNameWithFullPath)) {
    fileContent = fs.readFileSync(fileNameWithFullPath) + "";
  }
  return fileContent;
}

// -------------------------------
exports.setHtmlTemplatesFolder = setHtmlTemplatesFolder;
exports.setImagesFolder = setImagesFolder;
exports.generatePDF = generatePDF;
