import React, {useState, useEffect, createRef} from 'react';
import EditObject2 from './EditObject2';
import ListObjects from './ListObjects';
import Widgets from './Widgets';
import ObjectInfo from './ObjectInfo';
import {round2} from '../helpers';

// Bootstrap 4
//import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import {THREE} from 'panolens-three';
import TWEEN from '@tweenjs/tween.js'; // Wrong: TWEEN is inside panolens-three, but I cant access to it! import {TWEEN} from 'panolens-three' doesnt work.


export default function AppEditPosterlens( { data, setAppMode } ) {

  // React states and refs
  const [plOptions, setPlOptions] = useState();
  const [currentObject3D, setCurrentObject3D] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editParams, setEditParams] = useState( {
    POSTERLENS_CONTAINER_ID: 'posterlens-container',
    SCALE_FACTOR : 1.01,
    ROTATE_DEG : 0.05, // radians. 3.1416 is 180 deg.
    currentMouse3DPosition: [0,0,0],
    AUTO_START_EDIT_MODE : 1,
  } );
  const [countRestarts, setCountRestarts] = useState(0);
  const [info, setInfo] = useState('');

  var refContainer = createRef();
  var refContainerParent = createRef();

  const globalVars = {
    THREE: THREE,
    TWEEN: TWEEN,
    stopAllAnimations: window.stopAllAnimations
  }



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
    
    localStorage.setItem('lastSelectedObj.name', currentObject3D.name);
    // currentObject3D.material.blending = 2;
  }, [currentObject3D])
  
  // Methods helpers

  // x,y,z of mouse inside the 3d world. posterlens has this functions, but it doesnt work if I call it in onmousemove.
  const getMouse3Dposition = function(event) {
    if (!window.pl) return
    const v = window.pl.viewer;
    if (!v) { console.warn('Cant retrieve mouse pos, not viewer defined'); return; }

    const intersects = v.raycaster.intersectObject( v.panorama, true );
    if ( intersects.length <= 0 ) return;
    let i = 0;
    while ( i < intersects.length ) {
        if (intersects[i].object.name === 'invisibleWorld') {
            const point = intersects[i].point.clone();
            const world = v.panorama.getWorldPosition( new THREE.Vector3() );
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
    window.pl.changePano(1);
    window.pl.viewer.panorama.addEventListener('load', () => {
      // init also selected obj if it was selected before
      const lso = localStorage.getItem('lastSelectedObj.name');
      if (lso) {
        const selObj = window.pl.getObjectByName(lso);
        if (selObj) setCurrentObject3D(selObj);
      }
      // Debug with chrome three inspector.
      window.scene = window.pl.viewer.getScene();

     if (isEditMode) globalVars.stopAllAnimations(window.pl.viewer);

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

  function syncPlOptionsAndLocalStorage(plOptions) {
    setPlOptions(plOptions);
    var exportStr = JSON.stringify(plOptions, false, 2);
    localStorage.setItem('pl.o', exportStr);
    return exportStr;
  }

  // Object 3d in viewer ===> Options in pl.
  // =======================> Options pl
  function singleObject3DToParams(object3D) {
  

    // const worldParams = getCurrentPanoramaParams();
    // let objectHotspotIndex = worldParams.hotspots.findIndex( ht => ht.name === object3D?.name );
    // if (objectHotspotIndex < 0 ) {
    //   // not found, we create it. This will never happen. And if it did , it would be wront. It should create more than a name.
    //   worldParams.hotspots.push({ name: object3D.name });
    //   objectHotspotIndex = worldParams.hotspots.length - 1;
    //   //return;
    // }

    const objectCurrentParams = getOptionsByObject3D(object3D); // worldParams.hotspots[objectHotspotIndex];
    const objectNewParams     = {...objectCurrentParams};

    if (!objectCurrentParams) { alert('error: no objectCP'); return; }
    // pos, scale and rot
    objectNewParams.pos = [round2(object3D.position.x), round2(object3D.position.y), round2(object3D.position.z)];
    objectNewParams.rot = [round2(object3D.rotation.x), round2(object3D.rotation.y), round2(object3D.rotation.z)];
    // if (object3D.name === 'TEST') debugger
    objectNewParams.scale = round2(object3D.scale.x);
    // map params from object into options:

    const defaults = { 'opacity': 1, 'animatedMap': 1 }
    const mapParams = {
      'opacity': 'material.opacity',
      'type' : 'type',
    }
    
    // special params for type
    switch (object3D.type) {
      case 'pl_text-3d': 
        mapParams.emissive = 'material.emissive';
        mapParams.transparent = 'material.transparent';
        break;
      case 'pl_text-2d-sprite': 
      case 'pl_text-2d': 
        mapParams.color = 'material.color';
        break;
      case 'pl_poster3d': 
        // mapParams.animatedMap = 'material.transparent';
      default:
      break;
    }

    // foreach field in the object 3d we save it as an option param
    Object.keys(mapParams).forEach( option => {
      const obFields = mapParams[option].split('.');
      var currentField = object3D; // currentField has the value in the object 3d. ie, for field opacity, it has 0.5
      obFields.forEach( field => currentField = currentField[field] ); // currentfield = "resources/img.jpg"
      // fix if it's a color (rgb object): convert into string
      // if (currentField.hasOwnProperty('r') && currentField.hasOwnProperty('g')) currentField = currentField.getHexString();
      // fix type. In object has prefix pl_
      if (option==='type') currentField = currentField.replace('pl_', '');
      // if (option==='background') currentField = currentField? currentField : 'transparent';
      

      if (currentField === null && objectNewParams.hasOwnProperty(option)) 
        delete(objectNewParams[option]);
      else {
        if (defaults.hasOwnProperty(option)) { // save only if it not default
          if (defaults[option] != currentField) 
            objectNewParams[option] = currentField; // { "image" : "resources/img.jpg" }
        } else
          objectNewParams[option] = currentField;
      }
    } );

    // params only in options and not visible from object 3D (we need a panel and an input to edit it)
    // image, animatedMap, animatedMapSpeed, alwaysLookatCamera, text, hoverText, link
    

    // update pl with the new options
    // const newOptions = Object.assign({}, plOptions);
    // newOptions.worlds[getCurrentPanoramaParamsIndex()].hotspots[objectHotspotIndex] = objectNewParams;
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
      if (regenerate) {
        const object = window.pl.getObjectByName(name);
        if (name && window.pl.viewer.panorama && objectData ) {
          window.pl.viewer.panorama.remove( object );
          window.pl.createNewObjectFromParams(window.pl.viewer.panorama, objectData); // recreate the 3d in the viewer
          const newObject = window.pl.getObjectByName(name);
          setTimeout(()=>selectObject(newObject), 500);
          
        }
        else {        
          selectObject(object);
        }
      }
  }




  // remove all viewer. I should free up memory before...
  function destroyViewer() {
    document.querySelector('#'+editParams.POSTERLENS_CONTAINER_ID).innerHTML = '';
  }

  




  return <React.Fragment>
    { currentObject3D? <ObjectInfo currentObject3D={currentObject3D} getCurrentPanoramaParams={getCurrentPanoramaParams} /> : null }
    { plOptions? <ListObjects currentObject3D={currentObject3D} plOptions={plOptions} selectObject={selectObject} 
                              setCurrentObject3D={setCurrentObject3D} getCurrentPanoramaParams={getCurrentPanoramaParams} /> : null }
    <Container className='wrapper border pt-2' style={{ maxWidth:'1200px' }}>

      { plOptions? 
        <Button className="btn-sm" onClick={ e => restartViewer() }> RESET <span className="badge">{countRestarts}</span> </Button>         : null } 
      { !isEditMode? 
        <Button className="btn-secondary ml-5 btn-sm" onClick={ setIsEditMode(!isEditMode) }>Start Edit Mode</Button> : null } 
      { plOptions? 
        <Button className="btn btn-danger btn-sm" onClick={ (e) => { localStorage.setItem('pl.o', null); restartViewer(); }  }>Clear cache </Button> : null }

        <Button className="btn-secondary ml-5 btn-sm" onClick={ () => exportToTextarea() }>Export</Button>

        { currentObject3D? 
        <Button className="btn btn-danger btn-sm" onClick={ removeCurrentObject }>Delete</Button> : null }
        { currentObject3D? 
        <Button className="btn btn-success btn-sm" onClick={ cloneCurrentObject }>Clone</Button> : null }

        <Button variant="outline-primary btn-sm" onClick={ (e)=> { globalVars.stopAllAnimations(window.pl.viewer); e.target.remove() } }>Stop anim.</Button>
        <Button variant="outline-secondary btn-sm" onClick={ (e)=> setAppMode('demo') }>Demo</Button>

      <Row className="no-gutters" >
        <Col sm={12}>
          <div onMouseMove={ event => { getMouse3Dposition(event); } } ref={refContainerParent}>
           <div  id={editParams.POSTERLENS_CONTAINER_ID} className='posterlens-container' ref={refContainer}> </div>
          </div>
        </Col>
        { isEditMode? 
                   <EditObject2 plOptions={plOptions} isEditMode={isEditMode} editParams={editParams} currentObject3D={currentObject3D} setCurrentObject3D={setCurrentObject3D} getMouse3Dposition={getMouse3Dposition} 
                                singleObject3DToParams={singleObject3DToParams} setInfo={setInfo} updateObjectSingleData={updateObjectSingleData}
                                getCurrentPanoramaParams={getCurrentPanoramaParams} selectObject={selectObject} getOptionsByObject3D={getOptionsByObject3D}  />
                : null }
      </Row>


      

      
      
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
