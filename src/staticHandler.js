const fs = require('fs');

// Grab static pages
const homeHTML = fs.readFileSync(`${__dirname}/../client/home.html`);
const homeCSS = fs.readFileSync(`${__dirname}/../client/home.css`);
const homeJS = fs.readFileSync(`${__dirname}/../client/home.js`);
const articleHTML = fs.readFileSync(`${__dirname}/../client/article.html`);
const articleCSS = fs.readFileSync(`${__dirname}/../client/article.css`);
const articleJS = fs.readFileSync(`${__dirname}/../client/article.js`);
const createHTML = fs.readFileSync(`${__dirname}/../client/create.html`);
const createCSS = fs.readFileSync(`${__dirname}/../client/create.css`);
const createJS = fs.readFileSync(`${__dirname}/../client/create.js`);
const editHTML = fs.readFileSync(`${__dirname}/../client/edit.html`);
const editCSS = fs.readFileSync(`${__dirname}/../client/edit.css`);
const editJS = fs.readFileSync(`${__dirname}/../client/edit.js`);

// Methods for returning static content

const getHomeHTML = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(homeHTML);
  response.end();
};

const getHomeCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(homeCSS);
  response.end();
};

const getHomeJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(homeJS);
  response.end();
};

const getArticleHTML = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(articleHTML);
  response.end();
};

const getArticleCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(articleCSS);
  response.end();
};

const getArticleJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(articleJS);
  response.end();
};

const getCreateHTML = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(createHTML);
  response.end();
};

const getCreateCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(createCSS);
  response.end();
};

const getCreateJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(createJS);
  response.end();
};

const getEditHTML = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(editHTML);
  response.end();
};

const getEditCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(editCSS);
  response.end();
};

const getEditJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(editJS);
  response.end();
};

module.exports = {
  // Read
  getHomeHTML,
  getHomeCSS,
  getHomeJS,
  getArticleHTML,
  getArticleCSS,
  getArticleJS,
  // Create
  getCreateHTML,
  getCreateCSS,
  getCreateJS,
  // Update
  getEditHTML,
  getEditCSS,
  getEditJS,
};
