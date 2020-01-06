const workerpool = require('workerpool');


let recordedTimes = [];
function recordTimeStart(activityName) {
    recordedTimes[activityName] = {
        "start": new Date().getTime()
    };
    const tableRow = document.createElement("tr");
    const operationTd = document.createElement("td");
    const durationTd = document.createElement("td");
    operationTd.innerText = activityName;
    durationTd.innerText = "(in progress)";
    tableRow.appendChild(operationTd);
    tableRow.appendChild(durationTd);
    document.getElementById("times").appendChild(tableRow);
};

function recordTimeEnd(activityName) {
    recordedTimes[activityName]["end"] = new Date().getTime();
    recordedTimes[activityName]["duration"] = recordedTimes[activityName]["end"] - recordedTimes[activityName]["start"];
    var timesTbody = document.getElementById("times");
    const tableRow = document.createElement("tr");
    const operationTd = document.createElement("td");
    const durationTd = document.createElement("td");
    operationTd.innerText = activityName;
    durationTd.innerText = recordedTimes[activityName]["duration"];
    tableRow.appendChild(operationTd);
    tableRow.appendChild(durationTd);
    timesTbody.removeChild(timesTbody.lastChild);
    timesTbody.appendChild(tableRow);
};

async function loadImage(imageName, imagesDiv) {
    const imageNode = document.createElement("img");
    imageNode.src = "./images/" + imageName;
    imagesDiv.appendChild(imageNode);

    function onImageLoad() {
        return new Promise(resolve => {
            imageNode.addEventListener("load", resolve, {once: true});
        });
    }

    await onImageLoad();
    return imageNode;
}

function processImage(imageName, imageNode, pool) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", imageNode.naturalWidth);
    canvas.setAttribute("height", imageNode.naturalHeight);
    const canvasContext = canvas.getContext('2d');
    canvasContext.drawImage(imageNode, 0, 0);
    const imageData = canvasContext.getImageData(0, 0, imageNode.naturalWidth, imageNode.naturalHeight);
    const dataObj = {
        name: imageName,
        pixels: imageData.data.buffer,
        width: imageNode.naturalWidth,
        height: imageNode.naturalHeight
    };
    console.log("Processing image");
    const worker = pool.getW
    pool.queue(handleImage => {
        handleImage(dataObj).then(foundCat => {
            console.log("Found cat?", foundCat);
        });
    });
}


const imageNames = ["butterfly.png", "crocodiles.png", "cat.png", "birds_rainbow-lorakeets.png", "boxer-getting-tan.png", "boxer-laying-down.png"];
const imageNodes = [];

const imagesDiv = document.getElementById("images");
const pool = new WorkerPool("worker.js");

async function main() {
    for (let i = 0; i < imageNames.length; i++) {
        const imageNode = await loadImage(imageNames[i], imagesDiv);
        processImage(imageNames[i], imageNode, pool);
    }
}

main().catch(console.error)

 // https://www.kevinhoyt.com/2018/10/23/image-processing-in-a-web-worker/
 // https://www.kevinhoyt.com/2018/10/31/transferable-imagedata/
 // https://stackoverflow.com/questions/54359728/tensorflow-js-in-webworkers
 // https://github.com/tensorflow/tfjs/issues/102
 // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency
