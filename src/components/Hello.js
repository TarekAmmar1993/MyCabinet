

import icon from '../../assets/icon.svg';

function Hello() {
  function testii() {
    console.log('hmmm');
    window.electron.ipcRenderer.myTest();

  }

  function printPDF() {
    window.electron.ipcRenderer.printPDF();

  }

  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              🙏
            </span>
            Donate
          </button>
        </a>

        <button id="choose-btn" onClick={testii}>
          {' '}
          Select...
        </button>
        <button id="print-pdf" onClick={printPDF}>Print </button>
      </div>
    </div>
  );
}
export default Hello;
