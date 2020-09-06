import React, {useState, useEffect, createRef} from 'react';
import EditObject from './EditObject';
import './App.css';
import Widgets from './Widgets';
import Export from './Export';


function App( { data } ) {

  // React states and refs
  const [pl, setPl] = useState(null);
  const [worldOptions, setWorldOptions] = useState({}); // must be called in every currentObjectData change. TODO: try using useEffect and test it.
  const [currentObjectData, setCurrentObjectData] = useState(null);
  const [currentObject3D, setCurrentObject3D] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editParams, setEditParams] = useState( {
    SCALE_FACTOR : 1.1,
    ROTATE_DEG : 0.1, // radians. 3.1416 is 180 deg.
    currentMouse3DPosition: [0,0,0],
    // currentLookAt: [0,0,0],
    // currentCameraFov: 0,
    AUTO_START_EDIT_MODE : 1
  } );
  const [countRestarts, setCountRestarts] = useState(0);
  const [info, setInfo] = useState('');

  const refContainer = createRef();

  const globalVars = {
    THREE: eval('THREE'),
    stopAllAnimations: eval('stopAllAnimations')
  }

  const POSTERLENS_CONTAINER_ID = 'posterlens-container';

  // React Life cycle. INIT
  
  useEffect(() => {
    console.log('hello from useEffect in App');
    // create the interactive 3d viewer with posterlens
    createViewer();
    setCountRestarts(1);
  }, []);
  
  // called on init and restart
  useEffect(() => {
    // initialize this react plugin to make that viewer interactive.
    if (window.pl)
      if (editParams.AUTO_START_EDIT_MODE) 
        startEditMode();
  }, [countRestarts]);

  //  a simple msg
  useEffect( () => {
    if (info !== '') setTimeout( () => setInfo(''), 2000 );
  }, [info])
  
  // Methods

  // x,y,z of mouse inside the 3d world
  const getMouse3Dposition = function(event, pl) {
    const v = pl.viewer;
    if (!v) { console.warn('Cant retrieve mouse pos, not viewer defined'); return; }
    const intersects = v.raycaster.intersectObject( v.panorama, true );
    if ( intersects.length <= 0 ) return;
    let i = 0;
    while ( i < intersects.length ) {
        if (intersects[i].object.name === 'invisibleWorld') {
            const point = intersects[i].point.clone();
            const world = v.panorama.getWorldPosition( new globalVars.THREE.Vector3() );
            point.sub( world );
            const currentMP = [ Math.round(point.x.toFixed(2)/2), Math.round(point.y.toFixed(2)/2), Math.round(point.z.toFixed(2)/2) ];
            //const currentLookAt = getCurrentLookAt(pl);
            setEditParams( Object.assign( {}, editParams, { currentMouse3DPosition: currentMP } ) );
            return currentMP;        
            
        }
        i++;
    }
  }
  const getCurrentLookAt = function(pl){
    let calculatedLookAt = pl.viewer.camera.getWorldDirection(new globalVars.THREE.Vector3()).multiplyScalar(500);
    calculatedLookAt = [Math.round(calculatedLookAt.x), Math.round(calculatedLookAt.y), Math.round(calculatedLookAt.z) ];
    return calculatedLookAt;
  }

  // handlers
  const startEditMode = function( e ) {
    if (!pl)  return;
    // get current wolrd:      
    setWorldOptions(pl.o.worlds.find( w => w.name === pl.viewer.panorama.name ));
    setIsEditMode(true);
    // init mousover get position all time
    pl.viewer.renderer.domElement.addEventListener('mousemove', event => { getMouse3Dposition(event, window.pl); } );  
    globalVars.stopAllAnimations(pl.viewer, true);
  }

  function restartViewer() {
    destroyViewer();
    setPl(null);
    setIsEditMode(false);
    delete(window.pl);
    createViewer();
    setCountRestarts(countRestarts + 1);
    // and widgets are rerenderr because its key is associated to countRestarts, so they are loaded ok.
  }

  // remove all viewer and free memory
  function destroyViewer() {
    document.querySelector('#'+POSTERLENS_CONTAINER_ID).innerHTML = '';
  }

  // CALL to posTERLENS
  function createViewer() {
    var posterlensConfig = {}
    if (!data) console.log('data variable not found.')
    else posterlensConfig = data;
    
    // load from cache by default
    var retrievedWorldOptions = JSON.parse( localStorage.getItem('worldOptions') ); //retrieve the object to load cache
    posterlensConfig = (retrievedWorldOptions?.worlds) ? retrievedWorldOptions : posterlensConfig;
    if (!posterlensConfig) {
      console.error('No data loaded. Cant initialize');
      return;
    }

    // debugger: CALL TO POSTERLENS
    window.pl = document.querySelector('#'+POSTERLENS_CONTAINER_ID).posterlens( posterlensConfig );
    setPl(window.pl);

    // Debug with chrome three inspector.
    setTimeout(() => {
            window.scene = window.pl.viewer.getScene();
        }, 500);   
    
  }
  




  return (
    <div className='wrapper' style={{ maxWidth:'1200px' }}  >
      

      <div  id={POSTERLENS_CONTAINER_ID} className='posterlens-container'  
            style={ { width: '100%', height:'100%' } } ref={refContainer}>
      </div>

      { pl? (<button className="btn btn-primary" onClick={ (e) => restartViewer() }> RESET <span className="badge">{countRestarts}</span> </button>) : null } 
      { !isEditMode? <button className="btn btn-primary" onClick={ startEditMode }>Start Edit Mode </button> : null } 
      {/* <button className="btn btn-warning" onClick={ () => localStorage.setItem('worldOptions', JSON.stringify(worldOptions))  }>Update</button> */}
      { isEditMode? <button className="btn btn-primary" onClick={ () => { 
                                                            window.pl.o.initialLookAt = getCurrentLookAt(window.pl); 
                                                            window.pl.o.cameraFov = window.pl.viewer.camera.fov;
                                                            setWorldOptions(Object.assign({},worldOptions));  // triggers the export fn to save in local storage
                                                            setInfo('Updated'); }  }>
                      Set Initial View
                    </button> : null } 
      { isEditMode? ( <label><input type="checkbox" className="form-control"
                                    defaultChecked={ window.pl.o.autoRotate } 
                                    onChange={ () => {
                                                      window.pl.o.autoRotate = !window.pl.o.autoRotate;
                                                      setWorldOptions(Object.assign({}, worldOptions));  // triggers the export fn to save in local storage
                                                      }
                                              } />
                                        Auto rotate 
                      </label>) : null }


      Mouse 3D: position: { editParams.currentMouse3DPosition? editParams.currentMouse3DPosition[0] + ', ' + editParams.currentMouse3DPosition[1] + ', ' + editParams.currentMouse3DPosition[2] : null }
      <br/>Camera: { editParams.currentLookAt? editParams.currentLookAt[0] + ', ' + editParams.currentLookAt[1] + ', ' + editParams.currentLookAt[2] : null }
      
      <div className='info' style={ {color: 'red'} }>{ info }</div>

      { isEditMode? 
        <EditObject pl={pl} isEditMode={isEditMode} worldOptions={worldOptions} setWorldOptions={setWorldOptions} editParams={editParams} globalVars={globalVars} currentObject3D={currentObject3D} setCurrentObject3D={setCurrentObject3D} currentObjectData={currentObjectData} setCurrentObjectData={setCurrentObjectData} getMouse3Dposition={getMouse3Dposition} setInfo={setInfo} />
        : null }

      { isEditMode? <Widgets pl={pl} isEditMode={isEditMode} setIsEditMode={setIsEditMode} globalVars={globalVars} 
                              setCurrentObjectData={setCurrentObjectData}  worldOptions={worldOptions}  setWorldOptions={setWorldOptions}  setCurrentObject3D={setCurrentObject3D}  
                              key={countRestarts} restartViewer={restartViewer} /> : null }


        <Export worldOptions={worldOptions} pl={pl} editParams={editParams} />
    </div>
  );
}

export default App;
