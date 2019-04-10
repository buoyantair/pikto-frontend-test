const imagesList = document.querySelector("#images-list");

async function fetchImageURLs() {
  return fetch("/images").then(data => data.json());
}

function generateImage(src, parentNode) {
  const imageContainer = document.createElement("li");
  const image = document.createElement("img");
  image.setAttribute("src", src);

  imageContainer.appendChild(image);
  parentNode.appendChild(imageContainer);
}

async function generateImageList() {
  const imageURLs = await fetchImageURLs();

  for (let imageURL of imageURLs) {
    generateImage(imageURL, imagesList);
  }
}

generateImageList();
