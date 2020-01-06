class ReusableWorker {
    constructor(url) {
        this.worker = new Worker(url);
        this.inUse = false;
        this.worker.addEventListener("message", (e) => {

        });
    }

    async sendMessage(message, transferables) {

        function onMessageReceived() {
            return new Promise(resolve => {
                this.worker.addEventListener("message", (e) => {
                    this.inUse = false;
                    resolve(e);
                }, {once: true});
            });
        }
        this.inUse = true;
        this.worker.postMessage(message, transferables);
        const message = await onMessageReceived();
        return message;
    }
}

export default class WorkerPool {

    constructor(url) {
        this.url = url;
        this.workers = [];
        this.queuedMessages = [];
        this.maxWorkers = navigator.hardwareConcurrency;
    }

    async queueMessage(message, transferable) {
        if (this.workers.length < this.maxWorkers) {
            console.log("Creating new worker");
            const worker = new ReusableWorker(this.url);
            return await worker.sendMessage(message, transferable);
        } else {
            this.queuedMessages.push([message, transferable]);

        }
    }
};
