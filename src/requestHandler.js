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

  const article = {
    author: params.author,
    authorWebsite: params.authorWebsite,
    title: params.title,
    content: params.content,
    headerImageSrc: params.imageSrc,
    creationDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    lastEditDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    isDeleted: false,
    id: articleId,
  };

  // Form query for inserting Articles into the Article table
  const createArticleQuery = 'INSERT INTO Article SET ?';
  // Send blogpost to mysql database
  const connection = sqlFunctions.getConnection();
  connection.connect(() => {
    connection.query(createArticleQuery, [article], (err) => {
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
            imageSrc: article.headerImageSrc,
            articleId: article.id,
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
getRecentArticles - Searches the Article table for recent articles
Returns an articles object containing the requested page of articles
////////////////////
Parameters:
page - page number to return - starts at 1
rpp - results per page
////////////////////
Status Codes:
200 - Articles returned
400 - Missing page/rpp parameter or the mysql search has an error
*/
const getRecentArticles = (request, response, params) => {
  // Missing parameters. 400
  if (!params.page || !params.rpp) {
    const badPostContent = {
      id: 'missingParams',
      message: 'Need page and rpp parameter. Missing parameters.',
    };

    if (request.method === 'GET') {
      returnJSON(request, response, 400, badPostContent);
    } else if (request.method === 'HEAD') {
      returnHeadJSON(request, response, 400);
    }
    return;
  }

  if (isNaN(params.page) || isNaN(params.rpp)) {
    const badPostContent = {
      id: 'missingParams',
      message: 'Page number or results per page is not a number. Bad parameters.',
    };

    if (request.method === 'GET') {
      returnJSON(request, response, 400, badPostContent);
    } else if (request.method === 'HEAD') {
      returnHeadJSON(request, response, 400);
    }
    return;
  }

  const lowRow = params.rpp * (params.page - 1);

  const connection = sqlFunctions.getConnection();

  connection.connect(() => {
    connection.query('SELECT * FROM Article WHERE isDeleted = false ORDER BY creationDate DESC LIMIT ?, ?', [lowRow, parseInt(params.rpp, 10)], (err, results) => {
      // Send 400 on error
      if (err) {
        const articlesNotReturnedContent = {
          id: 'articlesNotReturned',
          message: `Could not return recent articles. ${err}`,
        };

        if (request.method === 'GET') {
          returnJSON(request, response, 400, articlesNotReturnedContent);
        } else if (request.method === 'HEAD') {
          returnHeadJSON(request, response, 400);
        }
        return;
      }

      // No page results - return 404
      if (!results || !results[0] || results === undefined) {
        const pageEmptyContent = {
          id: 'pageEmpty',
          message: `Page: ${params.page} with ResultsPerPage: ${params.rpp}, is empty.`,
        };

        if (request.method === 'GET') {
          returnJSON(request, response, 404, pageEmptyContent);
        } else if (request.method === 'HEAD') {
          returnHeadJSON(request, response, 404);
        }
        return;
      }

      // Send a 200 with returned articles
      const articleReturnedContent = {
        id: 'pageReturned',
        message: 'The page you requested yielded results.',
        articles: results,
      };

      if (request.method === 'GET') {
        returnJSON(request, response, 200, articleReturnedContent);
      } else if (request.method === 'HEAD') {
        returnHeadJSON(request, response, 200);
      }
    });
  });
};

/*
editArticle - Updates article with the given id in the mysql db
/////////////////////
Parameters:
id - char(12) - not null
author - varchar(256) - not null
authorWebsite - varchar(256) - can be null
title - varchar(256) - not null
content - text - not null
headerImageSrc - varchar(2083) - can be null
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

  const edited = {
    author: params.author,
    authorWebsite: params.authorWebsite,
    title: params.title,
    content: params.content,
    headerImageSrc: params.imageSrc,
    lastEditDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  // Edit article
  const connection = sqlFunctions.getConnection();
  connection.connect(() => {
    connection.query('UPDATE Article SET ? WHERE isDeleted = 0 AND id = ?', [edited, params.id], (err) => {
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
deleteArticle - 'Deletes' article with the given id (just sets the isDeleted property to true)
I could actually delete it, but this is effictively the same thing to the user and gives me a
placeholder for dead links. Might be good for accidental/temporary deletion or something.
/////////////////////
Parameters:
id - char(12) - not null
/////////////////////
Status Codes:
204 - If article with the id passed in existed, it is now deleted
400 - Can not delete article - faulty parameters or mysql query errored out
*/
const deleteArticle = (request, response, params) => {
  if (!params.id) {
    const badPostContent = {
      id: 'missingParams',
      message: 'An id parameter is needed to delete an article. Missing parameters.',
    };

    returnJSON(request, response, 400, badPostContent);
    return;
  }

  // Set article to isDeleted
  const connection = sqlFunctions.getConnection();
  connection.connect(() => {
    connection.query('UPDATE Article SET isDeleted = true WHERE id = ?', [params.id], (err) => {
      // Send 400 for failed sql search
      if (err) {
        const articleNotDeletedContent = {
          id: 'articleNotDeleted',
          message: `Could not delete the article. ${err}`,
        };

        returnJSON(request, response, 400, articleNotDeletedContent);
      }

      // Article successfully deleted
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
  getRecentArticles,
  // Update
  editArticle,
  // Delete
  deleteArticle,
  // Catch All
  routeNotFound,
};
