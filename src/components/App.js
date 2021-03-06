import React, {useState, useEffect} from 'react'
import AppDemoPosterlens from './AppDemoPosterlens';
import AppEditPosterlens from './AppEditPosterlens';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function App() {
  
  /* Retrieving possible variables from outside the App */
  /* ------------------------ --------------------------- */
  useEffect( () => {
    console.log(`THREE and PANOLENS: ${window.PANOLENS}`,window.THREE);
    window.THREE = eval('THREE');
    window.PANOLENS = eval('PANOLENS');
    window.stopAllAnimations = window.stopAllAnimations;
  }, []);

  const isAppAsWidget       = window.appAsWidget? true : false; // when we use it in Wordpress, in a page, then it's a widget app
  const isEditModeDefault = window.location.hash === '#edit' || isAppAsWidget;
  const [appAsWidget, setAppAsWidget] = useState(isAppAsWidget);
  const [appMode, setAppMode] = useState(isEditModeDefault? 'edit' : 'demo');
  const codeValidation = window.codeValidation;  
  var data = window.data; // defined outside react, in the html calling this app
  /* ------------------------ --------------------------- */

  return appMode === 'edit' ?  <AppEditPosterlens data={data} setAppMode={setAppMode} appAsWidget={appAsWidget} codeValidation={codeValidation} /> : 
                               <AppDemoPosterlens data={data} setAppMode={setAppMode} appAsWidget={appAsWidget} />;
  
}