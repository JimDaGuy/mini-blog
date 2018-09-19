const sqlFunctions = require('./sqlFunctions.js');

// Borrowed from:
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const createArticleId = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text = `${text}${possible.charAt(Math.floor(Math.random() * possible.length))}`;
  }

  return text;
};

const returnJSON = (request, response, code, content) => {
  // Send content to json string
  const contentString = JSON.stringify(content);

  // Write JSON response
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.write(contentString);
  response.end();
};

/*
createPost - Adds a blog post to the database
Parameters:
author - varchar(256) - not null
authorWebsite - varchar(256) - can be null
title - varchar(256) - not null
content - text - not null
headerImageSrc - varchar(2083) - can be null
*/
const createArticle = (request, response, params) => {
  // Send bad request if neccesary params are missing
  if (!params.author || !params.title || !params.content) {
    const badPostContent = {
      id: 'missingParams',
      message: 'Creating a blog post requires an author, title, and content. Missing parameters',
    };

    returnJSON(request, response, 400, badPostContent);
    return;
  }

  // Create a random 12 character string as a unique identifier
  const articleId = createArticleId(12);

  const successfulPostContent = {
    id: 'postCreated',
    message: {
      author: params.author,
      authorWebsite: params.authorWebsite,
      title: params.title,
      content: params.content,
      imageSrc: params.imageSrc,
      articleId,
    },
  };

  // Form query for inserting Articles into the Article table
  let createArticleQuery = 'INSERT INTO Article (author, authorWebsite, title,';
  createArticleQuery = `${createArticleQuery} content, headerImageSrc, creationDate,`;
  createArticleQuery = `${createArticleQuery} lastEditDate, id)`;
  createArticleQuery = `${createArticleQuery} VALUES ('${params.author}', '${params.authorWebsite}',`;
  createArticleQuery = `${createArticleQuery} '${params.title}', '${params.content}', '${params.imageSrc}',`;
  createArticleQuery = `${createArticleQuery} NOW(), NOW(), '${articleId}')`;

  // Send blogpost to mysql database
  const connection = sqlFunctions.getConnection();
  connection.connect(() => {
    connection.query(createArticleQuery, (err) => {
      // Send 400 on error and 201 on success
      if (err) {
        const badRequestContent = {
          id: 'postNotCreated',
          message: `Could not create post. ${err}`,
        };
        returnJSON(request, response, 400, badRequestContent);
      } else {
        returnJSON(request, response, 201, successfulPostContent);
      }
    });
  });
};

const getArticle = () => {

};

module.exports = {
  createArticle,
  getArticle,
};
