import "./App.css";

import React, { Component } from "react";

import Downloader from "./Downloader";
import logo from "./ewok.png";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      downloadStatus: {
        comments: 0,
        images: 0,
        zipped: 0,
        inProgress: false,
        shouldStop: false
      }
    };

    this.downloader = new Downloader({
      onDownloadStatus: this.onDownloadStatus
    });
  }

  onUrlChange = url => {
    this.downloader.url = url;
  };

  onDownload = () => {
    this.downloader.download();
  };

  onStopDownload = () => {
    this.downloader.stop();
  };

  onDownloadStatus = status => {
    this.setState({ downloadStatus: status });
  };

  render() {
    return (
      <div className="App">
        <Header logo={logo} title={"Jodel Image Downloader"} />
        <input
          type="text"
          autoFocus={true}
          onChange={e => this.onUrlChange(e.target.value)}
          placeholder="Paste the sharable link here!"
        />
        <Body
          onDownload={this.onDownload}
          onStopDownload={this.onStopDownload}
          downloadStatus={this.state.downloadStatus}
        />
      </div>
    );
  }
}

export default App;

const Body = ({ onDownload, onStopDownload, downloadStatus }) => (
  <div className="container">
    <ol>
      <li>Share a Jodel</li>
      <li>Paste the URL &uarr; above &uarr;</li>
      <li>Press the &darr; download &darr; button</li>
      <li>Hope for the best and follow the progress</li>
    </ol>
    <div className="row">
      <button style={{ flexGrow: 1 }} onClick={onDownload}>
        Start download
      </button>
    </div>
    <div className="row">
      <button
        style={{ flexGrow: 1 }}
        className="button-outline"
        onClick={onStopDownload}
      >
        Stop
      </button>
    </div>
    <h2>Download status</h2>
    <StatusTable status={downloadStatus} />
  </div>
);

const Header = ({ logo, title }) => (
  <header className="App-header">
    <img src={logo} className="App-logo" alt="logo" />
    <h1 className="App-title">{title}</h1>
  </header>
);

const StatusTable = ({ status: { comments, images, zipped } }) => (
  <table>
    <thead>
      <tr>
        <th>Comments found</th>
        <th>Images found</th>
        <th>Zipped images</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{comments}</td>
        <td>{images}</td>
        <td>{zipped}</td>
      </tr>
    </tbody>
  </table>
);
