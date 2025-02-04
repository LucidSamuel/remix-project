const csjs = require('csjs-inject')

const css = csjs`

  .modalFooter {
  }
  .modalContent {
    box-shadow: 0 0 8px 10000px rgba(0,0,0,0.6),0 6px 20px 0 rgba(0,0,0,0.19);
    -webkit-animation-name: animatetop;
    -webkit-animation-duration: 0.4s;
    animation-name: animatetop;
    animation-duration: 0.4s
  }
  .modalBody {
    word-break: break-word;
    overflow-y: auto;
    max-height: 600px;
  }
  .modalFooterOk {
  }
  .modalFooterCancel {
  }
  @-webkit-keyframes animatetop {
    from {top: -300px; opacity: 0}
    to {top: 0; opacity: 1}
  }
  @keyframes animatetop {
    from {top: -300px; opacity: 0}
    to {top: 0; opacity: 1}
  }
`

module.exports = css
