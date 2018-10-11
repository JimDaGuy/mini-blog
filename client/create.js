(function iife() {
  const postBlogArticle = () => {
    const author = encodeURIComponent(document.getElementById('blogAuthor').value);
    const authorWebsite = encodeURIComponent(document.getElementById('authorWebsite').value);
    const title = encodeURIComponent(document.getElementById('blogTitle').value);
    const imageSrc = encodeURIComponent(document.getElementById('blogImage').value);
    const content = encodeURIComponent(document.getElementById('blogContent').value);
    const responseDiv = document.getElementById('responseDiv');

    const path = `/createArticle?author=${author}&authorWebsite=${authorWebsite}&title=${title}&imageSrc=${imageSrc}&content=${content}`;

    // Don't send a request to the API with faulty parameters
    if (author === '' || title === '' || content === '') {
      responseDiv.innerHTML = 'Cannot create post. Author, title, or content is empty.';
      return;
    }

    // Send post request to /createBlogpost
    const xhr = new XMLHttpRequest();
    xhr.open('POST', path);
    xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Content-Type', 'application/application/x-www-form-urlencoded');
    xhr.onload = () => {
      responseDiv.innerHTML = xhr.responseText;

      document.getElementById('blogAuthor').value = '';
      document.getElementById('authorWebsite').value = '';
      document.getElementById('blogTitle').value = '';
      document.getElementById('blogImage').value = '';
      document.getElementById('blogContent').value = '';
    };

    xhr.send();
  };

  const init = () => {
    const submitButton = document.getElementById('submitButton');
    submitButton.onclick = postBlogArticle;
  };

  window.onload = init;
}());
