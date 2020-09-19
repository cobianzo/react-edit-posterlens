import React, {useState, useEffect} from 'react'
import AppDemoPosterlens from './AppDemoPosterlens';
import AppEditPosterlens from './AppEditPosterlens';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../posterlens/posterlens.css';
import '../posterlens/posterlens.js';

// config file (data)
import data from '../posterlens-config-edit';

export default function App() {
  
  const [appMode, setAppMode] = useState(window.location.hash === '#edit'? 'edit' : 'demo');
 

//  return "TESTING";
  return appMode === 'edit' ?  <AppEditPosterlens data={data} setAppMode={setAppMode} /> : 
                               <AppDemoPosterlens data={data} setAppMode={setAppMode} />;
  
}