import SHA1 from "crypto-js/sha1";
import zip from "./AsyncZipJs";

zip.workerScriptsPath =
  process.env.NODE_ENV === "production"
    ? "/JodelImageDownloader/libs/zip.js/WebContent/"
    : "/libs/zip.js/WebContent/";

export default class ZipWriter {
  writer = null;
  fileQueue = [];

  async createWriter() {
    this.writer = await zip.createWriterAsync(
      new zip.BlobWriter("application/zip")
    );
    return this.writer;
  }

  async add(base64URI) {
    await this.writer.addAsync(
      `${SHA1(base64URI)}.jpeg`,
      new zip.Data64URIReader(base64URI)
    );
  }

  async addAll(base64URIArray) {
    for (let base64 of base64URIArray) {
      await this.writer.addAsync(
        `${SHA1(base64)}.jpeg`,
        new zip.Data64URIReader(base64)
      );
    }
  }

  async createZip() {
    return await this.writer.closeAsync();
  }
}
