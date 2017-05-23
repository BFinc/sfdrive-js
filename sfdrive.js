
{!REQUIRESCRIPT("https://apis.google.com/js/api.js")}
{!REQUIRESCRIPT("/support/console/36.0/integration.js")}

// clientId and scope are optional if auth is not required.
// setup clientId at https://console.cloud.google.com/apis/credentials

var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var CLIENT_ID = '<YOUR_CLIENT_ID>';
var SCOPE = 'https://www.googleapis.com/auth/drive.readonly'; 

var fileName = {!<SObject>.<FieldLabel>} + '.wav'; // for mapping salesforce fields that align with google drive file names, need file extension if '='
var fileType = 'audio/x-wav';
var windowWidth = '800';
var windowHeight = '150';

var QParams = "mimeType = '" + fileType + "' and name = '" + fileName + "'";
var files = [];

function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPE
  }).then(function () {
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}


function getFileId(){
  gapi.client.drive.files.list({
    'path': '/drive/v3/files',
    'method': 'GET',
    'q': QParams 
  }).then(function(response) {
    // could easily be utilized to list out related files in a lightning component here
    files = response.result.files; 
    for (var i = files.length - 1; i >= 0; i--) {
      if(files[i].name === fileName){
        console.log('File ' + i + ' : ' + files[i].name);
        // in case there are multiple files with the same name, all links will be generated
        // if pulling up something less specific than a name and file type may want to open windows outside of the loop
        window.open("https://drive.google.com/file/d/" + response.result.files[i].id + "/view", "_blank", "width=" + windowWidth + ", height=" + windowHeight);
      }
    }
  }, function(reason) {
    console.log('There has been an error with this request #ERR: GAPI-001');
  });
}

// currently the user will have to allow access and then click the link/button again
// need to follow up on a warning about chaining to the authentication process
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    getFileId();
  } else {
    gapi.auth2.getAuthInstance().signIn();
  }
}

gapi.load('client:auth2', initClient);
