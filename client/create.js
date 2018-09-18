(function iife() {
  const postBlogArticle = () => {
    const author = document.getElementById('blogAuthor').value;
    const title = document.getElementById('blogTitle').value;
    const imageSrc = document.getElementById('blogImage').value;
    const content = document.getElementById('blogContent').value;
    const responseDiv = document.getElementById('responseDiv');

    const path = `/createBlogpost?author=${author}&title=${title}&imageSrc=${imageSrc}&content=${content}`;

    // Don't send a request to the API with faulty parameters
    if (author === '' || title === '' || content === '') {
      responseDiv.innerHTML = 'Cannot create post. Author, title, or content is empty.';
      return;
    }

    // Send post request to /createBlogpost
    const xhr = new XMLHttpRequest();
    xhr.open('POST', path);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      responseDiv.innerHTML = xhr.responseText;

      document.getElementById('blogAuthor').value = '';
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
