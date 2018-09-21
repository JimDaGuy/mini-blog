(function iife() {
  const author = document.getElementById('blogAuthor');
  const authorWebsite = document.getElementById('authorWebsite');
  const title = document.getElementById('blogTitle');
  const imageSrc = document.getElementById('blogImage');
  const content = document.getElementById('blogContent');
  const formContainer = document.getElementById('formContainer');
  const editForm = document.getElementById('editForm');
  const responseContainer = document.getElementById('responseContainer');
  const editButton = document.getElementById('editButton');

  const loadEditBoxes = (articleId) => {
    const path = `/getArticle?id=${articleId}`;

    // Don't send a request to the API with faulty parameters
    if (articleId === null || !articleId || articleId === '') {
      let contentString = '<h3>Enter an article id to edit</h3>';
      contentString = `${contentString} <p>Replace ARTICLE_ID with the id of an article. /edit?id=ARTICLE_ID</p>`;
      formContainer.innerHTML = contentString;
      return;
    }

    // Send post request to /getArticle
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      const responseJSON = JSON.parse(xhr.responseText);

      // Set box content
      if (xhr.status === 200) {
        const articleJSON = responseJSON.article;

        // Set textbox to API response
        editForm.setAttribute('data-article-id', articleId);
        author.value = articleJSON.author || '';
        authorWebsite.value = articleJSON.authorWebsite || '';
        title.value = articleJSON.title || '';
        imageSrc.value = articleJSON.imageSrc || '';
        content.value = articleJSON.content || '';
        // Clear article container
        responseContainer.innerHTML = '';
        return;
      }

      // Article not found page
      if (xhr.status === 404) {
        author.value = '';
        authorWebsite.value = '';
        title.value = '';
        imageSrc.value = '';
        content.value = '';

        let contentString = '<h3>Article Not Found</h3>';
        contentString = `${contentString} <p>The article you are looking for could not be found.<br>`;
        contentString = `${contentString} Replace ARTICLE_ID with the id of an article. /edit?id=ARTICLE_ID</p>`;
        formContainer.innerHTML = contentString;
        return;
      }

      // Article deleted page
      if (xhr.status === 410) {
        let contentString = '<h3>Article Deleted</h3>';
        contentString = `${contentString} <p>The article you are looking for has been removed. Sorry!</p>`;
        formContainer.innerHTML = contentString;
        return;
      }

      // If an unhandled response is recieved, just stick the response in the div
      formContainer.innerHTML = '';
      responseContainer.innerHTML = xhr.responseText;
    };

    xhr.send();
  };

  const editArticle = () => {
    const articleId = editForm.getAttribute('data-article-id');
    let path = `/editArticle?id=${articleId}&author=${author.value}&authorWebsite=${authorWebsite.value}`;
    path = `${path}&title=${title.value}&imageSrc=${imageSrc.value}&content=${content.value}`;

    // Don't send a request to the API with faulty parameters
    if (articleId === null || !articleId || articleId === '') {
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', path);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      // Article was updated
      if (xhr.status === 204) {
        let contentString = '<h3>Article successfully edited</h3>';
        contentString = `${contentString} <p>Refresh the page to edit it again or read<br>`;
        contentString = `${contentString} your article at /article?id=${articleId}</p>`;
        editForm.innerHTML = contentString;
        responseContainer.innerHTML = '';
        return;
      }

      // Article was not edited - article is not found
      if (xhr.status === 404) {
        author.value = '';
        authorWebsite.value = '';
        title.value = '';
        imageSrc.value = '';
        content.value = '';

        let contentString = '<h3>Article could not be edited</h3>';
        contentString = `${contentString} <p>The article you were trying to edit could not be found.</p>`;
        editForm.innerHTML = contentString;
        responseContainer.innerHTML = '';
        return;
      }

      // Article was not edited - article is deleted
      if (xhr.status === 410) {
        let contentString = '<h3>Article Deleted</h3>';
        contentString = `${contentString} <p>The article you are to edit has been removed. Sorry!</p>`;
        editForm.innerHTML = contentString;
        responseContainer.innerHTML = '';
        return;
      }

      // If an unhandled response is recieved, just stick the response in the div
      editForm.innerHTML = '';
      responseContainer.innerHTML = xhr.responseText;
    };

    xhr.send();
  };

  const init = () => {
    const urlParams = new URLSearchParams(window.location.search);
    loadEditBoxes(urlParams.get('id'));
    editButton.onclick = editArticle;
  };

  window.onload = init;
}());
