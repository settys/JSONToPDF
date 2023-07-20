*JSONToPDF*

This is a NodeJS Server that exposes an API to convert a JSON in a given format to a PDF, by stiching together various HTML template files.

Example of input JSON is located in the folder\file
`example/input1.json` .

The HTML templates used in this code is located in the folder\file `assets/htmlTemplates` .

To Run the application, in a nodeJS environment do the following:

```
  npm install
  node .
```

Following is a Curl script to make the API Call.
```
curl -X POST "http://localhost:3001" -H "accept: application/json" -H "Content-Type: application/json" -d @example/input1.json
```

