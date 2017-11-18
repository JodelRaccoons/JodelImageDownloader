// Async the Zip package
export default (zip => {
  zip.createWriterAsync = someWriter => {
    return new Promise((resolve, reject) => {
      zip.createWriter(
        someWriter,
        writer => {
          writer.closeAsync = obj => {
            return new Promise(resolve => {
              writer.close(resolve);
            });
          };
          writer.addAsync = (name, reader) => {
            return new Promise(resolve => {
              writer.add(name, reader, resolve);
            });
          };
          resolve(writer);
        },
        error => reject(error)
      );
    });
  };

  return zip;
})(window.zip);
