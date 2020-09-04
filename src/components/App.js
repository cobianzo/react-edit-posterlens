import React, {useState, useEffect, createRef, useRef} from 'react';
import EditObject from './EditObject';
import './App.css';
import Widgets from './Widgets';
import Export from './Export';


function App( { posterlens } ) {

  // React states and refs
  const [pl, setPl] = useState(null);
  const [worldOptions, setWorldOptions] = useState({});
  const [objectsData, setObjectsData] = useState([]);
  const [objects3D, setObjects3D] = useState([]);
  const [currentObjectData, setCurrentObjectData] = useState(null);
  const [currentObject3D, setCurrentObject3D] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editParams, setEditParams] = useState( {
    SCALE_FACTOR : 1.1,
    ROTATE_DEG : 0.1, // radians. 3.1416 is 180 deg.
    currentMouse3DPosition: [0,0,0]
  } );
  const [info, setInfo] = useState('');

  const refContainer = createRef();
  var v = null;
  const globalVars = {
    THREE: eval('THREE'),
    stopAllAnimations: eval('stopAllAnimations')
  }

  // React Life cycle
  useEffect(() => {
    console.log('hello from useEffect in App');
  }, [])
  useEffect( () => {
    if (info !== '') setTimeout( () => setInfo(''), 2000 );
  }, [info])

  // Methods
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
            const currentMP = [ point.x.toFixed(2)/2, point.y.toFixed(2)/2, point.z.toFixed(2)/2 ];
            setEditParams( Object.assign( {}, editParams, { currentMouse3DPosition: currentMP } ) );
            return currentMP;
        }
        i++;
    }
  }

  // handlers
  const startEditMode = function( e ) {
    
    console.log(window.pl);
    if (pl)
      console.log(pl.viewer);
    else {
      setPl(window.pl);
      // get current wolrd:      
      setWorldOptions(window.pl.o.worlds.find( w => w.name === window.pl.viewer.panorama.name ));
      setIsEditMode(true);
      // setObjectsData(window.pl.o);
      setObjects3D(window.pl.getObjects());
      // init mousover get position
      window.pl.viewer.renderer.domElement.addEventListener('mousemove', event => getMouse3Dposition(event, window.pl) );
      
    }


    // init widgets in View

    // init Objects
    
  }

  




  return (
    <div className='wrapper' style={{ maxWidth:'1200px' }}  >
      
      <div id="posterlens-container" style={ { width: '100%', height:'100%' } } ref={refContainer}></div>
      <button className="btn btn-primary" onClick={ startEditMode }>Start Edit Mode </button>
      Mouse 3D: position: { editParams.currentMouse3DPosition? editParams.currentMouse3DPosition[0] + ', ' + editParams.currentMouse3DPosition[1] + ', ' + editParams.currentMouse3DPosition[2] : null }
      
      <div className='info' style={ {color: 'red'} }>{ info }</div>

      { isEditMode? 
        <EditObject pl={pl} isEditMode={isEditMode} worldOptions={worldOptions} setWorldOptions={setWorldOptions} editParams={editParams} globalVars={globalVars} currentObject3D={currentObject3D} setCurrentObject3D={setCurrentObject3D} currentObjectData={currentObjectData} setCurrentObjectData={setCurrentObjectData} getMouse3Dposition={getMouse3Dposition} setInfo={setInfo} />
        : null }

      { isEditMode? <Widgets pl={pl} isEditMode={isEditMode} setIsEditMode={setIsEditMode} globalVars={globalVars} 
                              setCurrentObjectData={setCurrentObjectData}  worldOptions={worldOptions}  setWorldOptions={setWorldOptions}  setCurrentObject3D={setCurrentObject3D}  /> : null }


        <Export worldOptions={worldOptions} />
    </div>
  );
}

export default App;
