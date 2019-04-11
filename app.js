const imagesList = document.querySelector("#images-list");
const uploadField = document.querySelector("#upload-field");
const submitButton = document.querySelector("#submit");
const addTextButton = document.querySelector("#addText");
const canvasElement = document.querySelector("#dropzone");

const canvasElements = [];

async function fetchImages() {
  const imageURLsResponse = await fetch("/images");
  return imageURLsResponse.json();
}

function generateImage(src, parentNode) {
  const imageContainer = document.createElement("li");
  const uniqueID = src.match(/uploads\-\d+/i)[0];
  const image = document.createElement("img");
  image.setAttribute("src", src);
  image.setAttribute("id", uniqueID);
  image.addEventListener("dragstart", dragStartHandler);
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

function dragStartHandler(ev) {
  // Add the target element's id to the data transfer object
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
}

function dragOverHandler(ev) {
  ev.preventDefault();
  // Set the dropEffect to copy
  ev.dataTransfer.dropEffect = "copy";
}

function dropHandler(e) {
  e.preventDefault();
  const { layerX: x, layerY: y } = e;
  // Get the id of the target and add the moved element to the target's DOM
  var data = e.dataTransfer.getData("text/plain");
  if (data) {
    const clone = document.getElementById(data).cloneNode(true);
    clone.removeAttribute("draggable");
    canvasElement.appendChild(clone);
    moveElement(clone, x, y)
  }
}

let currentDragElm = null;

function moveElement(element, x, y) {
  if (element) {
    const { width, height } = element.getBoundingClientRect();
    element.style.transform = `translate(${x - width / 2}px, ${y -
      height / 2}px)`;
  }
}

function dragHandler(e) {
  e.preventDefault();
  const { layerX: x, layerY: y } = e;
  if (currentDragElm !== null && currentDragElm === e.target) {
    moveElement(currentDragElm, x, y);
  }
}

function mouseDownHandler(e) {
  e.preventDefault();
  const isChild = canvasElement.contains(e.target) && e.target !== canvasElement;
  if (isChild) {
    currentDragElm = e.target;
    canvasElement.addEventListener("mousemove", dragHandler);
  }
}

function mouseUpHandler(e) {
  e.preventDefault();
  canvasElement.removeEventListener("mousemove", dragHandler);
}

fetchImages()
  .then(memoizeImageList)
  .then(generateImageList);

submitButton.addEventListener("click", uploadImage);
canvasElement.addEventListener("drop", dropHandler);
canvasElement.addEventListener("dragover", dragOverHandler);
canvasElement.addEventListener("mousedown", mouseDownHandler);
canvasElement.addEventListener("mouseup", mouseUpHandler);
