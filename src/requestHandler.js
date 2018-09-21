const sqlFunctions = require('./sqlFunctions.js');

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? process.env.baseUrl : 'localhost:3000';

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

// Return a json object with passed in parameters
const returnJSON = (request, response, code, content) => {
  // Send content to json string
  const contentString = JSON.stringify(content);

  // Write JSON response
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.write(contentString);
  response.end();
};

const returnHeadJSON = (request, response, code) => {
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.end();
};

/*
createPost - Adds a blog post to the database
////////////////////
Parameters:
author - varchar(256) - not null
authorWebsite - varchar(256) - can be null
title - varchar(256) - not null
content - text - not null
headerImageSrc - varchar(2083) - can be null
////////////////////
Status Codes:
201 - Article created
400 - Missing neccesary parameters or the mysql search has an error
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
    id: 'articleCreated',
    message: `Your article has been created! You can view your article at ${baseUrl}/article?id=${articleId}`,
    articleLink: `${baseUrl}/article?id=${articleId}`,
  };

  // Form query for inserting Articles into the Article table
  let createArticleQuery = 'INSERT INTO Article (author, authorWebsite, title,';
  createArticleQuery = `${createArticleQuery} content, headerImageSrc, creationDate,`;
  createArticleQuery = `${createArticleQuery} lastEditDate, isDeleted, id)`;
  createArticleQuery = `${createArticleQuery} VALUES ('${params.author}', '${params.authorWebsite}',`;
  createArticleQuery = `${createArticleQuery} '${params.title}', '${params.content}', '${params.imageSrc}',`;
  createArticleQuery = `${createArticleQuery} NOW(), NOW(), false, '${articleId}')`;

  // Send blogpost to mysql database
  const connection = sqlFunctions.getConnection();
  connection.connect(() => {
    connection.query(createArticleQuery, (err) => {
      // Send 400 on error and 201 on success
      if (err) {
        const badRequestContent = {
          id: 'articleNotCreated',
          message: `Could not create post. ${err}`,
        };
        returnJSON(request, response, 400, badRequestContent);
      } else {
        returnJSON(request, response, 201, successfulPostContent);
      }
    });
  });
};

/*
getArticle - Searches the database for an article with the passed in id
////////////////////
Parameters:
author - varchar(256) - not null
authorWebsite - varchar(256) - can be null
title - varchar(256) - not null
content - text - not null
headerImageSrc - varchar(2083) - can be null
////////////////////
Status Codes:
200 - Article found
400 - Missing id parameter or the mysql search has an error
404 - Article with matching id not found
410 - Article exists, but has been marked 'removed'
*/
const getArticle = (request, response, params) => {
  // Send bad request if neccesary params are missing
  if (!params.id) {
    const badPostContent = {
      id: 'missingParams',
      message: 'An id parameter is needed to return an article. Missing parameters.',
    };

    if (request.method === 'GET') {
      returnJSON(request, response, 400, badPostContent);
    } else if (request.method === 'HEAD') {
      returnHeadJSON(request, response, 400);
    }
    return;
  }

  // Form query for inserting Articles into the Article table
  let getArticleQuery = 'SELECT * FROM Article WHERE';
  getArticleQuery = `${getArticleQuery} id = '${params.id}'`;

  // Send blogpost to mysql database
  const connection = sqlFunctions.getConnection();
  connection.connect(() => {
    connection.query(getArticleQuery, (err, result) => {
      // Send 400 on error, 404 on article not found, and 200 on success
      if (err) {
        const articleNotReturnedContent = {
          id: 'articleNotReturned',
          message: `Could not search for article. ${err}`,
        };
        if (request.method === 'GET') {
          returnJSON(request, response, 400, articleNotReturnedContent);
        } else if (request.method === 'HEAD') {
          returnHeadJSON(request, response, 400);
        }
        // Send 404 if search has no results
      } else if (result.length < 1) {
        const searchEmptyContent = {
          id: 'searchEmpty',
          message: `Search for the id:${params.id} yielded no results`,
        };

        if (request.method === 'GET') {
          returnJSON(request, response, 404, searchEmptyContent);
        } else if (request.method === 'HEAD') {
          returnHeadJSON(request, response, 404);
        }
        // Found article
      } else {
        const article = result[0];

        // Article is deleted. Return 410 error code
        if (article.isDeleted) {
          const articleRemovedContent = {
            id: 'articleRemoved',
            message: 'This article has been removed. Sorry about that!',
          };

          if (request.method === 'GET') {
            returnJSON(request, response, 410, articleRemovedContent);
          } else if (request.method === 'HEAD') {
            returnHeadJSON(request, response, 410);
          }
          return;
        }

        // Article found and is not deleted. Send a 200
        const articleReturnedContent = {
          id: 'articleReturned',
          message: 'Article was found!',
          article: {
            author: article.author,
            authorWebsite: article.authorWebsite,
            title: article.title,
            content: article.content,
            imageSrc: article.imageSrc,
            articleId: article.articleId,
            creationDate: article.creationDate,
            lastEditDate: article.lastEditDate,
          },
        };

        if (request.method === 'GET') {
          returnJSON(request, response, 200, articleReturnedContent);
        } else if (request.method === 'HEAD') {
          returnHeadJSON(request, response, 200);
        }
      }
    });
  });
};

/*
editArticle - s
/////////////////////
Parameters:

/////////////////////
Status Codes:
204 - Article successfully updated
400 - Can not edit article - faulty parameters or mysql query errored out
404 - Can not edit article - article is not found
410 - Can not edit article - article is deleted
*/
const editArticle = (request, response, params) => {
  // Send bad request if neccesary params are missing
  if (!params.id || !params.author || !params.title || !params.content) {
    const badPostContent = {
      id: 'missingParams',
      message: 'Need id, author, title, and content to edit an article. Missing parameters.',
    };

    returnJSON(request, response, 400, badPostContent);
    return;
  }

  // Form query for inserting Articles into the Article table
  let editArticleQuery = `UPDATE Article SET author = '${params.author}', authorWebsite = '${params.authorWebsite}',`;
  editArticleQuery = `${editArticleQuery} title = '${params.title}', content = '${params.content}', headerImageSrc = '${params.imageSrc}',`;
  editArticleQuery = `${editArticleQuery} lastEditDate = NOW() WHERE isDeleted = 0 AND id = '${params.id}'`;

  // Edit article
  const connection = sqlFunctions.getConnection();
  connection.connect(() => {
    connection.query(editArticleQuery, (err) => {
      // Send 400 for failed sql search
      if (err) {
        const articleNotEditedContent = {
          id: 'articleNotEdited',
          message: `Could not update the article. ${err}`,
        };

        returnJSON(request, response, 400, articleNotEditedContent);
      }

      // Article successfully edited - send 204
      /*
      const articleEditedContent = {
        id: 'articleEdited',
        message: 'Article was edited.',
        article: {
          author: params.author,
          authorWebsite: params.authorWebsite,
          title: params.title,
          content: params.content,
          imageSrc: params.imageSrc,
          articleId: params.articleId,
        },
      };
      */

      returnHeadJSON(request, response, 204);
    });
  });
};

/*
routeNotFound - Catch-all method to return a 404 response
*/
const routeNotFound = (request, response) => {
  const notFoundContent = {
    id: 'notFound',
    message: 'The route you are searching for could not be found. Sorry!',
  };
  if (request.method === 'GET') {
    returnJSON(request, response, 404, notFoundContent);
  } else if (request.method === 'HEAD') {
    returnHeadJSON(request, response, 404);
  }
};

module.exports = {
  // Create
  createArticle,
  // Read
  getArticle,
  // Update
  editArticle,
  routeNotFound,
};
