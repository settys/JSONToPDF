 
 var htmlTemplatesFolder = undefined;
 function setHtmlTemplatesFolder(fldr) {
    htmlTemplatesFolder = fldr;
  }
  function generatePDF(request, response) {
    console.log(htmlTemplatesFolder, request.body); // your JSON
    response.send(request.body); // echo the result back
  }
 

  exports.setHtmlTemplatesFolder = setHtmlTemplatesFolder;
  exports.generatePDF = generatePDF;
