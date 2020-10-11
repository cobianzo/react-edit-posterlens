import React, {useState, useEffect, createRef} from 'react';
import EditObjectControls_Bottom from './Layout/EditObjectControls_Bottom';
import Widgets from './Widgets';
import {round2} from '../helpers';

// Bootstrap 4
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import TopBarButtonsAndPanels from './Layout/TopBarButtonsAndPanels';
import CanvasUI3D from './Layout/CanvasUI3D';

export default function AppEditPosterlens( { data, setAppMode, appAsWidget } ) {
  
  // React states and refs
  const [plOptions, setPlOptions] = useState(); // IMPORTANT. The goal of all this app is to generate these options. With them we can call posterlens to createa  tour.
  const [currentObject3D, setCurrentObject3D] = useState(null); // The current THREEjs selected object. Sometimes we use pl.lastSelectedObj, because there are events outside REACT that can't use the State
  const [isEditMode, setIsEditMode] = useState(false); // In this app, it's always true
  
  const [editParams, setEditParams] = useState( {
    POSTERLENS_CONTAINER_ID: 'posterlens-container', // the div id where we load posterlens
    SCALE_FACTOR : 1.01,                              // when using ctrl+ and ctrol- keys to change scale of object.
    ROTATE_DEG : 0.05,                                // radians. 3.1416 is 180 deg.
    currentMouse3DPosition: [0,0,0],                  // shown in left panel PanoInfo.js
    AUTO_START_EDIT_MODE : 1,
    isExpertMode: (typeof window.expertMode !== 'undefined')? window.expertMode : true  // shows more or less info.
  } );
  const [countRestarts, setCountRestarts] = useState(0); // not important
  const [info, setInfo] = useState('');

  const [onClickOption, setOnClickOption] = useState(null); // used in InputOnclickOption, but needs to be defined here.
  var refContainer = createRef();
  var refContainerParent = createRef();

  



  // React Life cycle. INIT
  
  useEffect(() => {
    console.log('hello from useEffect in App');
    // create the interactive 3d viewer with posterlens
    createViewer();
    setCountRestarts(1); // small helper
  }, []);
  
  // called on init and restart
  useEffect(() => {
    // initialize this react plugin to make that viewer interactive.
    if (window.pl)
      if (editParams.AUTO_START_EDIT_MODE) 
        setIsEditMode(true);
  }, [countRestarts]);

  //  a simple msg
  useEffect( () => {
    if (info !== '') setTimeout( () => setInfo(''), 2000 );
  }, [info])

  useEffect( () => {
    if (!currentObject3D) return;
    console.log('watch currentObject3D ----------------------')
    localStorage.setItem('lastSelectedObj.name', currentObject3D.name);
    
    // Object 3D ====> Inputs  !SHABBY WAY!
    const options = getOptionsByObject3D(currentObject3D);
    const formsSync = document.querySelectorAll('[sync-3d]');
    formsSync.forEach( formEl => {
      const option = formEl.getAttribute('sync-3d');
      let value = (typeof options[option] !== 'undefined' )? options[option] : '';
      // special case. The option is an object (rot.0)
      if (option.includes('.')) {
        const fields = option.split('.');
        value = options[fields[0]]? options[fields[0]][fields[1]] : '' ;
      }
      let inputDefault = formEl.getAttribute('sync-default'); // string "true" or "false"
      inputDefault = typeof inputDefault === 'undefined' || inputDefault === 'false' ? '' : inputDefault;
      if (value === '' && inputDefault) value = inputDefault;
       
      if (formEl.querySelector('input'))
        formEl.querySelector('input').value = value;
      if (formEl.querySelector('select'))
        formEl.querySelector('select').value = value;
      if (formEl.querySelector('input[type="checkbox"]'))
        formEl.querySelector('input[type="checkbox"]').checked = value? true : false ;

      if (option === 'onClickAction') { // special case. InputOnClickOption: This field handles a state that needs to be updated
        setOnClickOption(value);
      }

    })

    // currentObject3D.material.blending = 2;
  }, [currentObject3D])
  
  // Methods helpers

  // x,y,z of mouse inside the 3d world. posterlens has this functions, but it doesnt work if I call it in onmousemove.
  const reactGetMouse3Dposition = function(event) {
    if (!window.pl) return
    const v = window.pl.viewer;
    if (!v) { console.warn('Cant retrieve mouse pos, not viewer defined'); return; }

    const intersects = v.raycaster.intersectObject( v.panorama, true );
    if ( intersects.length <= 0 ) return;
    let i = 0;
    while ( i < intersects.length ) {
        if (intersects[i].object.name === 'invisibleWorld') {
            const point = intersects[i].point.clone();
            const world = v.panorama.getWorldPosition( new window.THREE.Vector3() );
            point.sub( world );
            const currentMP = [ Math.round(point.x.toFixed(2)/2), Math.round(point.y.toFixed(2)/2), Math.round(point.z.toFixed(2)/2) ];
            setEditParams( Object.assign( {}, editParams, { currentMouse3DPosition: currentMP } ) );
            return currentMP;        
            
        }
        i++;
    }
  }
  
  
  // handlers

    // CALL to posTERLENS
  function createViewer() {
    var posterlensConfig = {}
    if (!data) console.log('data variable not found.')
    else posterlensConfig = data; // `data` is loaded with external file tat sets up `var data = {..}`
    
    // load from cache by default
    var retrievedOptions = JSON.parse( localStorage.getItem('pl.o') ); //retrieve the object to load cache
//    console.log(retrievedOptions.worlds[0].hotspots[7].rot);
    posterlensConfig = (retrievedOptions?.worlds) ? retrievedOptions : posterlensConfig;
    if (!posterlensConfig) {
      console.error('No data loaded. Cant initialize');
      return;
    }

    // CALL POSTERLENS
    window.pl = document.querySelector('#'+editParams.POSTERLENS_CONTAINER_ID).posterlens( posterlensConfig );
    setPlOptions(window.pl.o);
    window.pl.viewer.panorama.addEventListener('load', () => {
      // init also selected obj if it was selected before
      const lso = localStorage.getItem('lastSelectedObj.name');
      if (lso) {
        const selObj = window.pl.getObjectByName(lso);
        if (selObj) setCurrentObject3D(selObj);
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
    destroyViewer();
    setPlOptions(null);
    setIsEditMode(false);
    delete(window.pl);
    createViewer();
    setCountRestarts(countRestarts + 1);
    // and widgets are rerenderr because its key is associated to countRestarts, so they are loaded ok.
  }

  // helpers
  function getOptionsByObject3D(object3D, option = null) {
    const currentWorldOptions = getCurrentPanoramaParams();
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
  // returns all pl options replacing the hotspots in current panorama with that name
  function plOptionsReplaceWorldParamsHotspot(name, objectData) {
    const currentWorldParams = getCurrentPanoramaParams();
    const getHotspotIndex   = currentWorldParams.hotspots.findIndex(ht => ht.name === name);
    if ( getHotspotIndex < 0 ) return;
    const newHotspots = [...currentWorldParams.hotspots];
    newHotspots[getHotspotIndex] = objectData;
    currentWorldParams.hotspots = newHotspots;
    return plOptionsReplaceWorldParams(currentWorldParams);
  }
 


  // updates plOptions (the js object with all the config to load posterlens).
  // updates the react state and the localstorage (it can be used outside of react). It also uses a callback that can be used outside react.
  function syncPlOptionsAndLocalStorage(plOptions) {
    setPlOptions(plOptions);
    var exportStr = JSON.stringify(plOptions, false, 2);
    localStorage.setItem('pl.o', exportStr);
    if (window.onSavePlOptionsCallback) window.onSavePlOptionsCallback(plOptions); // this fn is passed from outside react, and it can be useful
    return exportStr;
  }

  // Object 3d in viewer (rot por scale) ===> Options in pl.
  // =======================> Options pl
  function singleObject3DToParams(object3D) {
 
    const objectCurrentParams = getOptionsByObject3D(object3D); // worldParams.hotspots[objectHotspotIndex];
    const objectNewParams     = { ...objectCurrentParams };

    if (!objectCurrentParams) { alert('error: no objectCP'); return; }
    // pos, scale and rot
    objectNewParams.pos = [ round2(object3D.position.x), round2(object3D.position.y), round2(object3D.position.z) ];
    objectNewParams.rot = [ round2(object3D.rotation.x), round2(object3D.rotation.y), round2(object3D.rotation.z) ];
    // if (object3D.name === 'TEST') debugger
    objectNewParams.scale = round2(object3D.scale.x);  

    const newOptions = plOptionsReplaceWorldParamsHotspot(object3D.name, objectNewParams);
    syncPlOptionsAndLocalStorage(newOptions);
    
    return objectNewParams;

  }

  // when picking up the object iwth mouse or from list of objects.
  function selectObject(theObj) {
    if (!theObj) return false;
    // if (currentObject3D) currentObject3D.material.blending = 1;
    window.lastSelectedObj = theObj;
    setCurrentObject3D( theObj );
    // look at the object, I dont know how to do it
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
    syncPlOptionsAndLocalStorage(newO);
    window.pl.viewer.panorama.remove( currentObject3D );
    window.pl.viewer.panorama.remove( window.pl.viewer.scene.getChildByName(currentObject3D.name) ); // just in case (somethimes it doesn delete)
    setCurrentObject3D(null);
  }

  // clone in data and reload the viewer.
  function cloneCurrentObject() {
    if (!currentObject3D) return;
    const objectCurrentParams = Object.assign({}, getOptionsByObject3D(currentObject3D));
    const currentWorldParams  = getCurrentPanoramaParams();
    objectCurrentParams.name = "cloned_"+ objectCurrentParams.name;
    objectCurrentParams.pos = [ objectCurrentParams.pos[0], objectCurrentParams.pos[1] + 50, objectCurrentParams.pos[2]]
    currentWorldParams.hotspots.push(objectCurrentParams);
    const newPlOptions = plOptionsReplaceWorldParams(currentWorldParams);
    syncPlOptionsAndLocalStorage(newPlOptions);
    // we need to restart the viewer to create it.
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

    // args (inputs) ===> Options data
    // given name of object and updated fields in the way { link : "Hall" }, we update the p.currentObjectData and the worldOptions
    // in some cases, sync the 3d model with the new data in the case of the name.
    const updateObjectSingleData = function( name, fields = {}, regenerate = true ) { 
      
      const currentWorldOptions = getCurrentPanoramaParams();
      let objectHotspotIndex = currentWorldOptions.hotspots.findIndex( ht => ht.name === name );
      if (objectHotspotIndex < 0 ) return;
      // update the field
      let objectData = currentWorldOptions.hotspots.find( ht => ht.name === name ); // all fields => { name: '', type: '' ... }
      objectData = Object.assign({}, objectData, fields );
      Object.keys(objectData).forEach( k =>  (objectData[k] === null)? delete(objectData[k]) : false ); // cleanup
      const newPlOptions = plOptionsReplaceWorldParamsHotspot(name, objectData);
      syncPlOptionsAndLocalStorage(newPlOptions);
      
      // regenerate the 3d object (remove and generate)
      const object = window.pl.getObjectByName(name);
      if (regenerate) {
        if (name && window.pl.viewer.panorama && objectData ) {
          window.pl.viewer.panorama.remove( object );
          window.pl.createNewObjectFromParams(window.pl.viewer.panorama, objectData); // recreate the 3d in the viewer
          const newObject = window.pl.getObjectByName(name);
          setTimeout(()=>selectObject(newObject), 500);
          
        }
        else {        
          selectObject(object);
        }
      } // end regenrate

      // special field: name. TODO: check name is not repeated.
      if ( object && fields.hasOwnProperty('name') ) {
        object.name = fields.name;
        setCurrentObject3D(object);
      }
  }




  // remove all viewer. I should free up memory before...
  function destroyViewer() {
    document.querySelector('#'+editParams.POSTERLENS_CONTAINER_ID).innerHTML = '';
  }

  




  return <React.Fragment>
     
    <Container className={ 'wrapper border pt-2' + (editParams.isExpertMode? ' expert-mode' : ' no-expert-mode') } style={{ maxWidth:'1200px' }}>
      
      <TopBarButtonsAndPanels currentObject3D={currentObject3D} setCurrentObject3D={setCurrentObject3D} getCurrentPanoramaParams={getCurrentPanoramaParams} 
                              plOptions={plOptions} editParams={editParams} selectObject={selectObject}
                             plOptionsReplaceWorldParams={plOptionsReplaceWorldParams} syncPlOptionsAndLocalStorage={syncPlOptionsAndLocalStorage}
                             restartViewer={restartViewer} removeCurrentObject={removeCurrentObject} setAppMode={setAppMode} countRestarts={countRestarts} 
                             exportToTextarea={exportToTextarea} cloneCurrentObject={cloneCurrentObject} />

      
      <CanvasUI3D reactGetMouse3Dposition={reactGetMouse3Dposition} editParams={editParams} />
      
      { isEditMode? 
      <Row className="no-gutters" >
        <EditObjectControls_Bottom plOptions={plOptions} isEditMode={isEditMode} editParams={editParams} currentObject3D={currentObject3D} setCurrentObject3D={setCurrentObject3D} reactGetMouse3Dposition={reactGetMouse3Dposition} 
                    singleObject3DToParams={singleObject3DToParams} setInfo={setInfo} updateObjectSingleData={updateObjectSingleData}
                    getCurrentPanoramaParams={getCurrentPanoramaParams} selectObject={selectObject} getOptionsByObject3D={getOptionsByObject3D}
                    appAsWidget={appAsWidget} plOptionsReplaceWorldParams={plOptionsReplaceWorldParams} syncPlOptionsAndLocalStorage={syncPlOptionsAndLocalStorage} 
                    onClickOption={onClickOption} setOnClickOption={setOnClickOption} />
      </Row>
      : null }


      

      
      
      {/* <Button className="btn-warning" onClick={ () => localStorage.setItem('worldOptions', JSON.stringify(worldOptions))  }>Update</Button> */}
      <div className='info' style={ {color: 'red'} }>{ info }</div>

      

      { isEditMode? <Widgets plOptions={plOptions} isEditMode={isEditMode} setIsEditMode={setIsEditMode}  
                              setCurrentObject3D={setCurrentObject3D} plOptions={plOptions} singleObject3DToParams={singleObject3DToParams}
                              refContainer={refContainer}
                              key={countRestarts} restartViewer={restartViewer} 
                              plOptionsReplaceWorldParams={plOptionsReplaceWorldParams}
                              getCurrentPanoramaParams={getCurrentPanoramaParams} setPlOptions={setPlOptions}
                              
                              
                              /> : null }
    </Container>
    </React.Fragment>
}
