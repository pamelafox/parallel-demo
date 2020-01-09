import { spawn, Pool } from "threads";
import Highcharts from "highcharts";
import HC_more from 'highcharts/modules/gantt';
HC_more(Highcharts);

import "threads/register";
import {imageNames} from "./images.js";

async function loadImage(imageName, imagesDiv) {
    const containerNode = document.createElement("div");
    containerNode.classList.add("image-container");
    const overlayNode = document.createElement("div");
    overlayNode.className = "overlay overlay-unknown";
    overlayNode.innerText = "?";
    const imageNode = document.createElement("img");
    imageNode.className = "image";
    imageNode.src = "./images/" + imageName;
    containerNode.appendChild(imageNode);
    containerNode.appendChild(overlayNode);
    imagesDiv.appendChild(containerNode);

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
    pool.queue(async handleImage => {
        return handleImage(dataObj).then(foundCat => {
            if (foundCat) {
                imageNode.nextSibling.className = "overlay overlay-yes";
                imageNode.nextSibling.innerText = "✓";
            } else {
                imageNode.nextSibling.classList.add("overlay-no");
                imageNode.nextSibling.innerText = "✗";
            }
        });
    });
}


let numWorkers, numImages, chart, pool, startTime, endTime, imageNodes;

async function startWorkers() {
    startTime = new Date().getTime();
    let categoryNames = [];
    for (let i = 0; i < numWorkers; i++) {
        categoryNames.push('Worker ' + (i + 1));
    }
    chart = Highcharts.ganttChart('chart', {
        title: {
        text: 'Worker threads'
        },
        yAxis: {
            categories: categoryNames
        },
        xAxis: {
            min: new Date().getTime()
        },
        series: []
    });

    pool = Pool(() => spawn(new Worker("./worker.js")), numWorkers);

    let numTasks = 0;
    let workersTasks = {};
    let workersSeries = [];
    pool.events().subscribe(event => {
        const workerID = event.workerID;
        if (event.type === "taskQueued") {
            numTasks++;
        } else if (event.type === "taskStart") {
            if (!workersTasks[workerID]) {
                workersSeries[event.workerID] = chart.addSeries({name: 'Worker ' + event.workerID, data: []});
            }
            workersSeries[event.workerID].addPoint({
                name: 'Task ' + event.taskID + ': Started',
                start: new Date().getTime(),
                end: new Date().getTime(),
                y: workerID - 1,
                milestone: true
            }, true);
            imageNodes[event.taskID - 1].nextSibling.className = "overlay";
            imageNodes[event.taskID - 1].nextSibling.innerHTML = "<div class='loader'></div>";
        } else if (event.type === "taskCompleted") { // TODO: other termination states
            const allPoints = workersSeries[event.workerID].getValidPoints();
            const lastPoint = allPoints.pop();
            workersSeries[event.workerID].addPoint({
                name: 'Task ' + event.taskID,
                start: lastPoint.end,
                end: new Date().getTime(),
                y: workerID - 1
            }, true);
            workersSeries[event.workerID].removePoint(allPoints.length);
        } else if (event.type === "taskQueueDrained") {
            endTime = new Date().getTime();
            const duration = (endTime - startTime)/1000;
            document.getElementById("status").innerText = "Done processing. Duration: " + duration.toFixed(2) + " seconds";
        }
    });

    imagesDiv.innerHTML = "";
    imageNodes = [];

    const shuffledImageNames = imageNames.sort(() => Math.random() - 0.5);
    for (let i = 0; i < numImages; i++) {
        const imageName = shuffledImageNames[i];
        const imageNode = await loadImage(imageName, imagesDiv);
        imageNodes[i] = imageNode;
        processImage(imageName, imageNode, pool);
    }
}

const imagesDiv = document.getElementById("images");
const maxWorkers = navigator.hardwareConcurrency;
document.getElementById("workersRange").setAttribute("max", maxWorkers);
document.getElementById("workersRange").setAttribute("value", maxWorkers);
const maxImages = imageNames.length;
document.getElementById("imagesRange").setAttribute("max", maxImages);

var updateNumWorkers = function() {
    const val = document.getElementById("workersRange").value;
    document.getElementById("workersRangeVal").innerText = val;
    numWorkers = parseInt(val, 10);
};
document.getElementById("workersRange").addEventListener("change", updateNumWorkers);
updateNumWorkers();
var updateNumImages = function() {
    const val = document.getElementById("imagesRange").value;
    document.getElementById("imagesRangeVal").innerText = val;
    numImages = parseInt(val, 10);
};
document.getElementById("imagesRange").addEventListener("change", updateNumImages);
updateNumImages();

document.getElementById("processButton").addEventListener("click", () => {
    startWorkers().catch(console.error)
});