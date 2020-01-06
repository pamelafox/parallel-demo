import { expose } from "threads/worker";

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@1.0.0");
tf.setBackend('cpu');

let model;

async function detectCat(model, imageName, img) {
    let foundCat = false;
    const predictions = await model.classify(img);
    predictions.forEach((prediction) => {
        const classes = prediction.className.split(",");
        classes.forEach((predictionClass) => {
            if (predictionClass.endsWith("cat")) {
                foundCat = true;
            }
        });
    });
    return foundCat;
}

expose(async function handleImage(objData) {
        let imageName = objData.name;
        let imageData = new ImageData(
            new Uint8ClampedArray(objData.pixels),
            objData.width,
            objData.height
        );
        if (!model) {
            console.log("Loading model...")
            const model = await mobilenet.load();
            console.log("Model loaded...");
            return await detectCat(model, imageName, imageData);
        } else {
            console.log("Model already loaded");
            return await detectCat(model, imageName, imageData);
        }
    }
)