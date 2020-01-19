import { expose } from "threads/worker";

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@1.0.0");
tf.setBackend('cpu');

let model;

async function detectCat(model, img) {
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
        let imageData = new ImageData(
            new Uint8ClampedArray(objData.pixels),
            objData.width,
            objData.height
        );
        if (!model) {
            model = await mobilenet.load();
            return await detectCat(model, imageData);
        } else {
            return await detectCat(model, imageData);
        }
    }
);