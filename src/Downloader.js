import ZipWriter from "./ZipWriter";
import { sleep } from "./Utils";

export default class Downloader {
  status = new Proxy(
    {
      images: 0,
      comments: 0,
      zipped: 0,
      inProgress: false,
      shouldStop: false
    },
    {
      set: (obj, prop, value) => {
        if (prop === "inProgress" && value === false) obj["shouldStop"] = false;

        obj[prop] = value;
        this.onDownloadStatus(this.status);
        return true;
      }
    }
  );

  constructor({ url = "", onDownloadStatus } = {}) {
    this.url = url;
    this.images = [];
    this.onDownloadStatus = onDownloadStatus;
    this.zipWriter = new ZipWriter();
  }

  async save(blob, filename = "jodel-images.zip") {
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  stop() {
    this.status.shouldStop = true;
  }

  async zipSome(n) {
    if (this.zipWriter.writer === null)
      throw new Error("ZipWriter has a null writer. Create it first.");
    let completed = 0;
    while (this.images.length > 0 && completed < n) {
      let base64URI = this.images.pop();
      await this.zipWriter.add(base64URI);
      completed++;
      this.status.zipped++;
    }
  }

  async download() {
    const post = (this.url.match(/postId=([\w\d]*)/) || []).pop();
    if (typeof post === "undefined") throw new Error("Invalid URL");

    this.status.inProgress = true;

    let next = -1;
    let ojFilter = "false";
    let worker = document.createElement("span");

    const url = (_post = post, _next = next, _ojFilter = ojFilter) => {
      // First page
      if (_next === -1) return `https://share.jodel.com/post?postId=${_post}`;
      else
        return `https://share.jodel.com/post/${_post}/replies?next=${_next}&ojFilter=${_ojFilter}`;
    };

    await this.zipWriter.createWriter();

    while (next != null) {
      if (this.status.shouldStop) break;
      let response,
        slowdown = 0;
      do {
        // Zip some files while sending request
        let [, res] = await Promise.all([this.zipSome(3), fetch(url())]);
        response = res;
        console.debug("Slowdown:", slowdown);
        await sleep(slowdown);
        slowdown += 100;
      } while (!response.ok);

      const cleanDataURI = uri => {
        worker.innerHTML = uri;
        return worker.innerText;
      };
      let images = [],
        json = {},
        regexDataURI = /data:image\/jpeg;base64,(.*)(?=")/gm;
      // First page
      if (next === -1) {
        const text = await response.text();
        const firstImage = (text.match(regexDataURI) || []).pop();
        if (firstImage && /_image\.jpeg"\/>/.test(text))
          images.push(firstImage);
        next = 0;
      } else {
        json = await response.json();
        images = json.html.match(regexDataURI) || [];
        next = json.next;
      }
      images.map(cleanDataURI).forEach(image => {
        this.images.push(image);
        this.status.images++;
      });
      this.status.comments = next;
    }

    // Zip all the remaining images
    await this.zipSome(this.images.length);

    const blob = await this.zipWriter.createZip();
    await this.save(blob, `jp-${post}.zip`);
    this.status.inProgress = false;
  }
}
