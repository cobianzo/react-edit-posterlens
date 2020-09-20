import React, {useState, useEffect} from 'react'
import AppDemoPosterlens from './AppDemoPosterlens';
import AppEditPosterlens from './AppEditPosterlens';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../posterlens/posterlens.css';

// config file (data)
import data from '../posterlens-config-edit';

export default function App() {
  
  useEffect( () => {
    console.log(`THREE and PANOLENS: ${window.PANOLENS}`,window.THREE);
    window.THREE = eval('THREE');
    window.PANOLENS = eval('PANOLENS');
    window.stopAllAnimations = window.stopAllAnimations;
  }, []);

  const [appMode, setAppMode] = useState(window.location.hash === '#edit'? 'edit' : 'demo');
  

//  return "TESTING";
  return appMode === 'edit' ?  <AppEditPosterlens data={data} setAppMode={setAppMode} /> : 
                               <AppDemoPosterlens data={data} setAppMode={setAppMode} />;
  
}