// This is the call of the React APP.
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
// import * as serviceWorker from './serviceWorker';

/* Variables that can be set from the outside:
  window.appAsWidget = true;
  window.expertMode = false;
  window.plImgPath = 'http:// ... ' (not neccessary in appAsWidget mode)
  window.basePath = 'http://' or 'relative/path/' (needed to show the Widgets imgs, for example) 
  window.onSavePlOptionsCallback = function(plOpts) { ... whatever you want to do }
*/
const containers = document.querySelectorAll('.wrapper-posterlens-edit-container');
containers.forEach( (el,i)=>{
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    el
  );
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
