const AUTH0_CLIENT_ID_SSO_ON = 'zalZ1MTxYGmq72QYJ3fhsMl13Z5xfZga';
const AUTH0_CLIENT_ID_SSO_OFF = '1AG0JUe8bMsoGmoin4iIGapL0bPTLpU5';
const AUTH0_DOMAIN = 'demonstration.auth0.com';

if (!AUTH0_CLIENT_ID_SSO_ON || !AUTH0_DOMAIN) {
  alert('Make sure to set the AUTH0_CLIENT_ID_SSO_ON and AUTH0_DOMAIN variables in auth0-variables.js.');
}

function initAuth0(clientId) {
  console.log(`initAuth0 ${clientId}`);
  auth0js = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: clientId,
    audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
    scope: 'openid profile',
    responseType: 'token',
    redirectUri: 'http://localhost:3000'
  });
  auth0js.parseHash(window.location.hash, function(err, result) {
    if (err) {
      console.error(err);
    } else if (result) {
      saveAuthResult(result);
    }
  });
}

initAuth0(AUTH0_CLIENT_ID_SSO_ON);

function displayStatus () {
  let status;
  const token = localStorage.getItem('accessToken');
  const expirationDate = new Date(Number.parseInt(localStorage.getItem('expirationDate')));
  const isExpired = expirationDate < new Date();

  if (!token) {
    status = 'There is no access token present in llllocal storage, meaning that you are not logged in. <a href="#" onclick="renew()">Click here to attempt an SSO login</a> or <a href="#" onclick="nonSSOLogin()">Click here for non SSO login</a>';
  } else if (isExpired) {
    status = 'There is an expired access token in local storage. <a href="#" onclick="renew()">Click here to renew it</a>';
    document.getElementById('logout').style.visibility = 'visible';
  } else {
    status = `There is an access token in local storage, and it expires on ${expirationDate}. <a href="#" onclick="renew()">Click here to renew it</a>`;
    document.getElementById('logout').style.visibility = 'visible';
  }
  document.getElementById('status').innerHTML = status;
}

function saveAuthResult(result) {
  localStorage.setItem('accessToken', result.accessToken);
  localStorage.setItem('expirationDate', Date.now() + Number.parseInt(result.expiresIn) * 1000);
  displayStatus();
}

function nonSSOLogin() {
  // replace auth0js with Client ID of SSO Disabled client
  // TODO tidy up this mess with global variables and mutating methods etc..
  // inherited from sample..
  initAuth0(AUTH0_CLIENT_ID_SSO_OFF);
  renew();
}

function renew () {
  console.log(`auth0js: ${auth0js}`);
  auth0js.renewAuth({
    redirectUri: 'http://localhost:3000/callback.html',
    usePostMessage: true
  }, function(err, result) {
    if (err) {
      alert(`Could not get a new token using silent authentication (${err.error}). Redirecting to login page...`);
      auth0js.authorize();
    } else {
      saveAuthResult(result);
    }
  });
}


displayStatus();
