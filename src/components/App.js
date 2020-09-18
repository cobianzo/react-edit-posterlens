import React, {useState, useLayoutEffect} from 'react'
import AppDemoPosterlens from './AppDemoPosterlens';
import AppEditPosterlens from './AppEditPosterlens';

import './App.css';

export default function App( data ) {

  const [appMode, setAppMode] = useState(window.location.hash === '#edit'? 'edit' : 'demo');

  
  return appMode === 'edit' ?  <AppEditPosterlens data={data} setAppMode={setAppMode} /> : 
                               <AppDemoPosterlens data={data} setAppMode={setAppMode} />;
  
}