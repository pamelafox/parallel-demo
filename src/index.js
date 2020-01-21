import { spawn, Pool } from "threads";
import Highcharts from "highcharts";

import HC_more from 'highcharts/modules/gantt';
HC_more(Highcharts);

import "threads/register";
import {imageNames} from "./images.js";
import "./kittydar-0.1.6.js";

let numWorkers, numImages, numCats, chart, pool, startTime, endTime;
let ALGO = "kittydar";
let disableUI = false;

let imagesMap = {};
let imageNodes = [];
let numImagesLoaded = 0;
let imagesLoaded = false;
let startOnceLoaded = false;
function preloadImage(imageName) {
    const imageNode = new Image();
    imageNode.src = `./images/${imageName}`;
    imageNode.addEventListener("load", function() {
        numImagesLoaded++;
        if (numImagesLoaded === imageNames.length) {
            imagesLoaded = true;
            document.getElementById("images").innerHTML = "";
            if (startOnceLoaded) {
                startWorkers();
            }
        }
    }, {once: true});
    return imageNode;
}

function showImage(imageNode, imagesDiv) {
    const containerNode = document.createElement("div");
    containerNode.classList.add("image-container");
    imageNode.className = "image";
    containerNode.appendChild(imageNode);
    if (!disableUI) {
        const overlayNode = document.createElement("div");
        overlayNode.className = "overlay overlay-unknown";
        overlayNode.innerText = "?";
        containerNode.appendChild(overlayNode);
    }
    imagesDiv.appendChild(containerNode);
    return imageNode;
}

function updateImageLoading(imageNode) {
    if (disableUI) return;
    imageNodes[event.taskID - 1].nextSibling.className = "overlay";
    imageNodes[event.taskID - 1].nextSibling.innerHTML = "<div class='loader'></div>";
}

function updateImageRect(imageNode, rect) {
    if (disableUI) return;
    const resizedScale = imageNode.width/imageNode.naturalWidth;
    imageNode.nextSibling.className = "detection";
    imageNode.nextSibling.innerText = "";
    imageNode.nextSibling.style.left = (rect.x * resizedScale) + "px";
    imageNode.nextSibling.style.top = (rect.y * resizedScale) + "px";
    imageNode.nextSibling.style.width = (rect.width * resizedScale) + "px";
    imageNode.nextSibling.style.height = (rect.height * resizedScale) + "px";
}

function updateImageNo(imageNode) {
    if (disableUI) return;
    imageNode.nextSibling.classList.add("overlay-no");
    imageNode.nextSibling.innerText = "✗";
}

function updateImageYes(imageNode) {
    if (disableUI) return;
    imageNode.nextSibling.className = "overlay overlay-yes";
    imageNode.nextSibling.innerText = "✓";
}


function processImage(imageNode, pool) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", imageNode.naturalWidth);
    canvas.setAttribute("height", imageNode.naturalHeight);
    const canvasContext = canvas.getContext('2d');
    canvasContext.drawImage(imageNode, 0, 0);
    const imageData = canvasContext.getImageData(0, 0, imageNode.naturalWidth, imageNode.naturalHeight);
    const dataObj = {
        pixels: imageData.data.buffer,
        width: imageNode.naturalWidth,
        height: imageNode.naturalHeight
    };
    if (ALGO === "kittydar") {
        pool.queue(async handleCatImage => {
            return handleCatImage(dataObj).then(foundCat => {
                if (foundCat.length > 0) {
                    updateImageRect(imageNode, foundCat[0]);
                    numCats++;
                } else {
                    updateImageNo(imageNode);
                }
            });
        });
    } else {
        pool.queue(async handleImage => {
            return handleImage(dataObj).then(foundCat => {
                if (foundCat) {
                    updateImageYes(imageNode);
                    numCats++;
                } else {
                    updateImageNo(imageNode);
                }
            });
        });
    }
}

function createChart() {

    let categoryNames = ["Main"];
    for (let i = 0; i < numWorkers; i++) {
        categoryNames.push(`Worker ${(i + 1)}`);
    }
    Highcharts.setOptions({
        chart: {
            style: {
                fontFamily: 'Lato, sans-serif'
            }
        }
    });
   return Highcharts.ganttChart('chart', {
        title: {
            text: undefined
        },
        yAxis: {
            categories: categoryNames
        },
        xAxis: [{
            visible: false,
            opposite: false
        }, {
            min: startTime - 1000
        }],
        series: []
    });
}

async function startWorkers() {
    startTime = new Date().getTime();
    numCats = 0;

    let chartRows = [];
    if (!disableUI) {
        chart = createChart();
        chartRows[0] = chart.addSeries({name: "Main", data: []});
        chartRows[0].addPoint({
            name: 'Initializing',
            start: startTime,
            end: startTime,
            y: 0,
            milestone: true
        }, true);

        for (let i = 0; i < numWorkers; i++) {
            const workerID = i + 1;
            chartRows[workerID] = chart.addSeries({name: `Worker ${workerID}`, data: []});
        }
    }

    pool = Pool(() => {
        if (ALGO === "kittydar") {
            return spawn(new Worker("./worker-kittydar.js"));
        } else {
            return spawn(new Worker("./worker-tensorflow.js"));
        }
    }, numWorkers);

    if (!disableUI) {
        pool.events().subscribe(event => {
            const workerID = event.workerID;
            if (event.type === "taskStart") {
                // Add a point to the main timeline
                const mainPoints = chartRows[0].getValidPoints();
                if (mainPoints.length === 1) {
                    const lastPoint = mainPoints.pop();
                    chartRows[0].addPoint({
                        name: "Initialization complete",
                        start: lastPoint.end,
                        end: new Date().getTime(),
                        y: 0
                    }, true);
                }
                // Now update this worker's timeline
                chartRows[event.workerID].addPoint({
                    name: 'Task ' + event.taskID + ': Started',
                    start: new Date().getTime(),
                    end: new Date().getTime(),
                    y: workerID,
                    milestone: true
                }, true);
                updateImageLoading(imageNode);
            } else if (event.type === "taskCompleted") {
                const allPoints = chartRows[event.workerID].getValidPoints();
                const lastPoint = allPoints.pop();
                chartRows[event.workerID].addPoint({
                    name: 'Task ' + event.taskID,
                    start: lastPoint.end,
                    end: new Date().getTime(),
                    y: workerID
                }, true);
                chartRows[event.workerID].removePoint(allPoints.length, !disableUI);
            }
        });
    }

    let numTasksCompleted = 0;
    pool.events().subscribe(event => {
        if (event.type === "taskCompleted") {
            numTasksCompleted++;
        } else if (event.type === "taskQueueDrained" && numTasksCompleted === numImages) {
            endTime = new Date().getTime();
            const duration = (endTime - startTime)/1000;
            document.getElementById("status").innerHTML =
                `Done processing.<br>
                Detected: ${numCats} cats.<br>
                Processing time: ${duration.toFixed(2)} seconds.`;
        }
    });

    document.getElementById("status").innerHTML = "";
    imagesDiv.innerHTML = "";
    imageNodes = [];

    const shuffledImageNames = imageNames.sort(() => Math.random() - 0.5);
    for (let i = 0; i < numImages; i++) {
        const imageName = shuffledImageNames[i];
        console.log("imageName" + imageName);
        imageNodes[i] = imagesMap[imageName];
        console.log(imageNodes[i]);
        showImage(imageNodes[i], imagesDiv);
    }

    document.getElementById("status").innerHTML =  "Processing...";
    for (let i = 0; i < imageNodes.length; i++) {
        processImage(imageNodes[i], pool);
    }
}

const imagesDiv = document.getElementById("images");
const maxWorkers = navigator.hardwareConcurrency;
document.getElementById("workersRange").setAttribute("max", maxWorkers);
document.getElementById("workersRange").setAttribute("value", maxWorkers);
document.getElementById("concurrency").innerText = navigator.hardwareConcurrency;
const maxImages = imageNames.length;
document.getElementById("imagesRange").setAttribute("max", maxImages);
document.getElementById("imagesRange").setAttribute("value", maxImages);

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('disableUI') === "true") {
    disableUI = true;
}

var updateNumWorkers = function() {
    const val = document.getElementById("workersRange").value;
    document.getElementById("workersRangeVal").innerText = val;
    numWorkers = parseInt(val, 10);
};
document.getElementById("workersRange").addEventListener("input", updateNumWorkers);
updateNumWorkers();
var updateNumImages = function() {
    const val = document.getElementById("imagesRange").value;
    document.getElementById("imagesRangeVal").innerText = val;
    numImages = parseInt(val, 10);
};
document.getElementById("imagesRange").addEventListener("input", updateNumImages);
updateNumImages();

document.getElementById("processButton").addEventListener("click", () => {
    if (!imagesLoaded) {
        startOnceLoaded = true;
    } else {
        startWorkers().catch(console.error);
    }
});

document.getElementById("images").innerHTML = "<div class='loader'></div>";

for (let i = 0; i < imageNames.length; i++) {
    imagesMap[imageNames[i]] = preloadImage(imageNames[i]);
}

