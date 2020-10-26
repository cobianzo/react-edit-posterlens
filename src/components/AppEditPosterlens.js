/** Main container of the Layout. This is where all the real action starts */

import React, {useState, useEffect, createRef} from 'react';
import EditObjectControls_Bottom from './Layout/EditObjectControls_Bottom';
import TopBarButtonsAndPanels from './Layout/TopBarButtonsAndPanels';
import CanvasUI3D from './Layout/CanvasUI3D';
import Widgets from './Widgets';
import { validateCode } from '../helpers';

import { SyncObject3d__Inputs, SyncPlOptions__LocalStorage} from './SyncDataAlongApp'

// Bootstrap 4
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

export default function AppEditPosterlens( { data, setAppMode, appAsWidget, codeValidation } ) {
  
  // React states and refs
  const [plOptions, setPlOptions] = useState(); // IMPORTANT. The goal of all this app is to generate these options. With them we can call posterlens to createa  tour.
  const [currentObject3D, setCurrentObject3D] = useState(null); // The current THREEjs selected object. Sometimes we use pl.lastSelectedObj, because there are events outside REACT that can't use the State
  const [isEditMode, setIsEditMode] = useState(false); // In this app, it's always true
  const [initialDataBackup, setInitialDataBackup] = useState(false); // Used for the button Undo changes. Set the plOptions to this backuped initial value.
  
  const [editParams, setEditParams] = useState( {
    POSTERLENS_CONTAINER_ID: 'posterlens-container', // the div id where we load posterlens
    SCALE_FACTOR : 1.01,                              // when using ctrl+ and ctrol- keys to change scale of object.
    ROTATE_DEG : 0.05,                                // radians. 3.1416 is 180 deg.
    currentMouse3DPosition: [0,0,0],                  // shown in left panel PanoInfo.js
    AUTO_START_EDIT_MODE : 1,
    codeValidated: validateCode(codeValidation),
    MAX_OBJECTS_PER_PANO: validateCode(codeValidation)? 1000 : 3,                          // To make the plugin PRO later.
    isExpertMode: (typeof window.expertMode !== 'undefined')? window.expertMode : true  // shows more or less info.
  } );
  const [countRestarts, setCountRestarts] = useState(0); // not important
  

  const [onClickOption, setOnClickOption] = useState(null); // used in InputOnclickOption, but needs to be defined here.
  
  



  // React Life cycle. INIT
  
  useEffect(() => {
    console.log('INIT AppEditPosterlens! React rocks 🤘');
    // create the interactive 3d viewer with posterlens
    createViewer();
    setCountRestarts(1); // small helper
  }, []);
  
  // called on init and restart: WATCH countRestarts
  useEffect(() => {
    // initialize this react plugin to make that viewer interactive.
    if (window.pl)
      if (editParams.AUTO_START_EDIT_MODE) 
        setIsEditMode(true);
  }, [countRestarts]);

  /* WATCH currentObject3D: Onchange on currentObject3D selection in the UI.
  *   we basically update the inputs with the values inside the plOptions for that hotspot 
  */
  useEffect( () => {    if (!currentObject3D) return;

    localStorage.setItem('lastSelectedObj.name', currentObject3D.name); // never used i think
    
    /* Object 3D ====> Inputs  !SHABBY WAY! */
    SyncObject3d__Inputs( { currentObject3D, getOptionsByObject3D, setOnClickOption } );   
    const originalBlend = currentObject3D.material.blending;
    const originalColor = currentObject3D.material.color;
    currentObject3D.material.blending = 2;
    if (currentObject3D.type === 'pl_text-3d') currentObject3D.material.wireframe = true;
    currentObject3D.material.color = { r:0, g:1, b:0};
    setTimeout(()=> {
      currentObject3D.material.blending = originalBlend;
      currentObject3D.material.color = originalColor;
    }, 800 );
  }, [currentObject3D])
  
   
  
  /**
   *  CALL to posTERLENS
   */
  function createViewer() {

    var posterlensConfig = {}
    if (!data) console.log('data variable not found.')
    else posterlensConfig = {... data } ; // `data` is loaded with external file tat sets up `var data = {..}`
    
    if (!initialDataBackup) { // only when the app is loaded. Fro mhere, if the viewer is reset, we will not enter here.
      setInitialDataBackup( JSON.stringify(data) );
    } else posterlensConfig = JSON.parse(initialDataBackup);

    // load from cache by default
     var retrievedOptions = JSON.parse( localStorage.getItem('pl.o') ); //retrieve the object to load cache

    posterlensConfig = (retrievedOptions?.worlds) ? retrievedOptions : posterlensConfig;
    if (!posterlensConfig) {
      console.error('No data loaded. Cant initialize');
      return;
    } 

    window.plEditMode = true; // this avoid animations while editing the pano

    // CALL POSTERLENS
    window.pl = document.querySelector('#'+editParams.POSTERLENS_CONTAINER_ID).posterlens( posterlensConfig );
    setPlOptions(window.pl.o);
    window.pl.viewer.panorama.addEventListener('load', () => {
      // init also selected obj if it was selected before
      const lso = localStorage.getItem('lastSelectedObj.name');
      if (lso) {
        const selObj = window.pl.getObjectByName(lso);
        if (selObj) {
          selectObject(selObj)
        }
      }
      // Debug with chrome three inspector.
      window.scene = window.pl.viewer.getScene();
      if (isEditMode) window.stopAllAnimations(window.pl.viewer);

      
    });
  }

  useEffect( () => { 
    window.pl.viewer.editMode = isEditMode;
  }, [isEditMode]);
  
  function restartViewer() {
    alert('restarting viewer');
    console.log('plOptions', plOptions);
    destroyViewer();
    setPlOptions(null);
    setIsEditMode(false);
    localStorage.setItem('lastCameraLookat', window.pl.getCameraDirection('lookatPoint'));
    localStorage.setItem('currentPano', window.pl.viewer.panorama.name );
    delete(window.pl);
    createViewer();
    setCountRestarts(countRestarts + 1);
    // and widgets are rerenderr because its key is associated to countRestarts, so they are loaded ok.
    // better with ? window.pl.viewer.panorama.addEventListener('load', () => {
    setTimeout( () => { // we need this just to refresh otherwise the object cant be selected... dont know...
      const input = document.querySelector('#input-name form');
        if (input) input.dispatchEvent(new Event("submit"));
      let lastCameraLookat = localStorage.getItem('lastCameraLookat').split(',')
      lastCameraLookat = lastCameraLookat.map( i => parseInt(i) ); // needed
      window.pl.viewer.setControlCenter(new window.THREE.Vector3( ...lastCameraLookat ));
      localStorage.removeItem("lastCameraLookat"); 
      const lastPanoSelected = localStorage.getItem('currentPano');
      if (lastPanoSelected) {
        window.pl.changePano(lastPanoSelected);
      }
    }, 500);
    
  }

  // helpers
  function getOptionsByObject3D(object3D, option = null) {
    const currentWorldOptions = getCurrentPanoramaParams();
    if (!currentWorldOptions) return;
    let objectData = currentWorldOptions.hotspots.find( ht => ht.name === object3D?.name );
    if (objectData && option) return objectData[option];
    return objectData;
  }
  function getCurrentPanoramaParams() {
    if (!plOptions) return null;
    return plOptions.worlds.find( w => w.name === window.pl.viewer.panorama.name );
  }
  function getCurrentPanoramaParamsIndex() {
    return plOptions.worlds.findIndex( w => w.name === window.pl.viewer.panorama.name );
  }
  // returns all pl with the new worldparmas at the place of the current panorama params
  function plOptionsReplaceWorldParams(worldParams) {
    const newOptions = Object.assign({}, plOptions);
    newOptions.worlds[getCurrentPanoramaParamsIndex()] = {...worldParams};
    return newOptions;
  }
  // returns all pl options replacing the hotspot data in current panorama with that name
  function plOptionsReplaceWorldParamsHotspot(name, objectData) {
    const currentWorldParams = getCurrentPanoramaParams();
    const getHotspotIndex   = currentWorldParams.hotspots.findIndex(ht => ht.name === name);
    if ( getHotspotIndex < 0 ) return;
    const newHotspots = [...currentWorldParams.hotspots];
    newHotspots[getHotspotIndex] = objectData;
    currentWorldParams.hotspots = newHotspots;
    return plOptionsReplaceWorldParams(currentWorldParams);
  }
 
  // when picking up the object iwth mouse or from list of objects.
  function selectObject(theObj) {
    if (!theObj) return false;      // if (currentObject3D) currentObject3D.material.blending = 1;
    window.lastSelectedObj = theObj;
    window.lastSelectedObj.lastPosition = window.lastSelectedObj.position.clone();
    window.lastSelectedObj.lastRotation = window.lastSelectedObj.rotation.clone();
    setCurrentObject3D( theObj );   // look at the object, I dont know how to do it
    // now also see the WATCH (useEffect for currentObject3D )
  }

  // remove from data and in viewer
  function removeCurrentObject() {
    if (!currentObject3D) return;
    const currentWorldOptions = getCurrentPanoramaParams();
    const currentWorldOptionsIndex = getCurrentPanoramaParamsIndex();
    let objectHotspotIndex = currentWorldOptions.hotspots.findIndex( ht => ht.name === currentObject3D.name );
    let newPlOptionsHotspots = [...currentWorldOptions.hotspots];
    let hotspotIndex = newPlOptionsHotspots.findIndex( ht => ht.name === currentObject3D.name );
    newPlOptionsHotspots.splice(hotspotIndex,1); //delte in array
    const newO = {...plOptions};
    newO.worlds[currentWorldOptionsIndex].hotspots = newPlOptionsHotspots;
    SyncPlOptions__LocalStorage(newO, setPlOptions);
    window.pl.viewer.panorama.remove( currentObject3D );
    window.pl.viewer.panorama.remove( window.pl.viewer.scene.getChildByName(currentObject3D.name) ); // just in case (somethimes it doesn delete)
    setCurrentObject3D(null);
  }

  // clone in data and reload the viewer.
  function cloneCurrentObject() {
    if (!currentObject3D) return;
    const objectCurrentParams = Object.assign({}, getOptionsByObject3D(currentObject3D));
    const currentWorldParams  = getCurrentPanoramaParams();
    const newName             = "cloned_"+ objectCurrentParams.name;
    objectCurrentParams.name  = newName;
    objectCurrentParams.pos = [ parseFloat(objectCurrentParams.pos[0]) + 50, parseFloat(objectCurrentParams.pos[1]) + 50, objectCurrentParams.pos[2]]
    currentWorldParams.hotspots.push(objectCurrentParams);
    const newPlOptions = plOptionsReplaceWorldParams(currentWorldParams);
    
    SyncPlOptions__LocalStorage(newPlOptions, setPlOptions);
    // we need to restart the viewer to create it.
    localStorage.setItem('lastSelectedObj.name', newName);
    restartViewer();

  }

  // shows modal with all the options
  function exportToTextarea() {
    var exportStr = JSON.stringify(plOptions, false, 2);
    var textA = document.createElement( 'textarea' );
    textA.textContent = exportStr;
    textA.style.width = '100%'
    textA.style.height= '500px';
    window.pl.Modal('Export JSON', textA);
  }





  // remove all viewer. I should free up memory before...
  function destroyViewer() {
    document.querySelector('#'+editParams.POSTERLENS_CONTAINER_ID).innerHTML = '';
  }

  




  return (     
    <Container className={ 'posterlens-wrapper border pt-2' 
                      + ( editParams.codeValidated? ' validated ' : ''  )
                      + (editParams.isExpertMode? ' expert-mode' : ' no-expert-mode') } >
      
      <TopBarButtonsAndPanels data={data} currentObject3D={currentObject3D} setCurrentObject3D={setCurrentObject3D} getCurrentPanoramaParams={getCurrentPanoramaParams} 
                              plOptions={plOptions} setPlOptions={setPlOptions} editParams={editParams} selectObject={selectObject}
                             plOptionsReplaceWorldParams={plOptionsReplaceWorldParams}
                             restartViewer={restartViewer} removeCurrentObject={removeCurrentObject} setAppMode={setAppMode} countRestarts={countRestarts} 
                             exportToTextarea={exportToTextarea} cloneCurrentObject={cloneCurrentObject} />

      
      <CanvasUI3D editParams={editParams} setEditParams={setEditParams} isEditMode={isEditMode}
                  getOptionsByObject3D={getOptionsByObject3D} selectObject={selectObject}
                  plOptions={plOptions} setPlOptions={setPlOptions} plOptionsReplaceWorldParamsHotspot={plOptionsReplaceWorldParamsHotspot}
      />
      
      { isEditMode? 
      <Row className="no-gutters" >
        
        <EditObjectControls_Bottom plOptions={plOptions} setPlOptions={setPlOptions} isEditMode={isEditMode} 
                    editParams={editParams} setEditParams={setEditParams}
                    currentObject3D={currentObject3D} setCurrentObject3D={setCurrentObject3D} 
                    plOptionsReplaceWorldParamsHotspot={plOptionsReplaceWorldParamsHotspot}
                    getCurrentPanoramaParams={getCurrentPanoramaParams} selectObject={selectObject} getOptionsByObject3D={getOptionsByObject3D}
                    appAsWidget={appAsWidget} plOptionsReplaceWorldParams={plOptionsReplaceWorldParams}
                    onClickOption={onClickOption} setOnClickOption={setOnClickOption} />
      </Row>
      : null }

      { isEditMode? <Widgets plOptions={plOptions} isEditMode={isEditMode} setIsEditMode={setIsEditMode}  
                              setCurrentObject3D={setCurrentObject3D} plOptions={plOptions} 
                              key={countRestarts} restartViewer={restartViewer} selectObject={selectObject}
                              plOptionsReplaceWorldParams={plOptionsReplaceWorldParams}
                              getCurrentPanoramaParams={getCurrentPanoramaParams} setPlOptions={setPlOptions}
                              editParams={editParams}
                              
                              /> : null }
    </Container>)

}
