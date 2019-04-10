const imagesList = document.querySelector("#images-list");
const uploadField = document.querySelector("#upload-field");
const submitButton = document.querySelector("#submit");

async function fetchImages() {
  const imageURLsResponse = await fetch("/images");
  return imageURLsResponse.json();
}

function generateImage(src, parentNode) {
  const imageContainer = document.createElement("li");
  const image = document.createElement("img");
  image.setAttribute("src", src);

  imageContainer.appendChild(image);
  parentNode.appendChild(imageContainer);
}

async function generateImageList(imageURLs) {
  for (let key in imageURLs) {
    generateImage(imageURLs[key], imagesList);
  }
}

async function memoizeImageList(urls) {
  let imageURLs = urls;
  const imageElements = document.querySelectorAll("#images-list img");

  for (let imageElement of imageElements) {
    if (!imageURLs.includes(imageElement.currentSrc)) {
      imageElement.remove();
    } else {
      imageURLs = imageURLs.filter(url => url !== imageElement.currentSrc);
    }
  }

  return imageURLs;
}

function disableFields(val) {
  uploadField.disabled = val;
  submitButton.disabled = val;
}

async function uploadImage() {
  const files = uploadField.files;
  if (files.length) {
    const formData = new FormData();
    formData.append("upload", files[0]);
    disableFields(true);

    const uploadResponse = await fetch("/uploads", {
      method: "POST",
      body: formData
    });

    disableFields(false);
    if (uploadResponse.ok) {
      console.log("Upload successful");
      fetchImages()
        .then(memoizeImageList)
        .then(generateImageList);
    }
  }
}

fetchImages()
  .then(memoizeImageList)
  .then(generateImageList);

submitButton.addEventListener("click", uploadImage);
