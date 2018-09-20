const http = require('http');
const url = require('url');
const query = require('querystring');

const isProduction = process.env.NODE_ENV === 'production';

const sqlFunctions = require('./sqlFunctions.js');
const staticHandler = require('./staticHandler.js');
const requestHandler = require('./requestHandler.js');
// Use local variables file only when running locally
const localvars = isProduction ? {} : require('./localvars.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

sqlFunctions.setConnectionSettings(isProduction, localvars);
sqlFunctions.establishConnection(isProduction);

const staticStruct = {
  '/': staticHandler.getHomeHTML,
  '/css': staticHandler.getHomeCSS,
  '/js': staticHandler.getHomeJS,
  '/create': staticHandler.getCreateHTML,
  '/createCSS': staticHandler.getCreateCSS,
  '/createJS': staticHandler.getCreateJS,
  '/edit': staticHandler.getEditHTML,
  '/editCSS': staticHandler.getEditCSS,
  '/editJS': staticHandler.getEditJS,
  '/article': staticHandler.getArticleHTML,
  '/articleCSS': staticHandler.getArticleCSS,
  '/articleJS': staticHandler.getArticleJS,
};

const requestStruct = {
  '/createArticle': requestHandler.createArticle,
  '/editArticle': '',
  '/deleteArticle': '',
  '/getArticle': requestHandler.getArticle,
  '/getRecentArticles': '',
  '/searchArticles': '',
  '/routeNotFound': requestHandler.routeNotFound,
};

const onRequest = (request, response) => {
  console.log(request.url);

  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);
  const path = parsedUrl.pathname;

  if (path === '/favicon.ico') {
    response.end();
    return;
  }

  // Call methods that don't require params
  if (staticStruct[path]) {
    staticStruct[path](request, response);
    return;
  }

  // Call methods requiring params
  if (requestStruct[path]) {
    requestStruct[path](request, response, params);
  } else {
    requestStruct['/routeNotFound'](request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
