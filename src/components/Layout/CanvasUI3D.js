import React, { useEffect } from 'react'

import Row from 'react-bootstrap/Row'
import {reactGetMouse3Dposition} from '../../helpers';
import { SyncObject3d__DataHotspot } from '../SyncDataAlongApp'


// move an object closer or farther from the camera.
export function z_move(object3D, direction = 'close'){
  let offset = 1.02;
  if (direction === 'close') offset = 1/offset;
              
  var newPos = object3D.position.clone();
  newPos.x *= offset; newPos.y *= offset; newPos.z *= offset;
  const distance = window.pl.viewer.camera.position.distanceTo(newPos);
  if ( (direction !== 'close' && distance > 500) || (direction === 'close' && distance < 40)) {
      console.warn('we cant move that limit. Its out of 40 - 500m');
      return
  }
  window.pl.setObjectPos(object3D, [newPos.x, newPos.y, newPos.z]);
}


/**
 * The div placeholder where posterlens.js loads the threejs panolens panorama
 */
function CanvasUI3D( p ) {

  function placeObjectOnMouse(event, theObj){
      if (!theObj) return;
      let newPos = reactGetMouse3Dposition(event, { setEditParams: p.setEditParams, editParams: p.editParams })
      if (!newPos) return;
      const v = new window.THREE.Vector3(...newPos).normalize().multiplyScalar(theObj.distance);
      window.pl.setObjectPos(theObj, [v.x, v.y, v.z]);
  }

  // triggered on load, only once.
  useEffect(() => { 
    if (!window.pl) return;
    // console.log('pl updated in edit', window.pl);
    const v = window.pl.viewer;
    v.renderer.domElement.addEventListener('mousedown', (event) => { handlerPickupObject(event) });

    
    // --- move object 
    v.renderer.domElement.addEventListener('mousemove', function (event) {
      placeObjectOnMouse(event, window.selectedObj)
    });
    v.renderer.domElement.addEventListener('mouseup', (event) => { handlerDropObject(event) });
    // document.addEventListener('keydown', (event) => { handlerScaleRotateObject(event) } );
    
    // double click places the last obj where clicked. Useful when we lock objects.
    v.renderer.domElement.addEventListener('dblclick', function (event) {
      if (window.lastSelectedObj)
        placeObjectOnMouse(event, window.lastSelectedObj);
    });

  }, [p.plOptions] );

  // --- pickup object 
  const handlerPickupObject = (event) => {
      if ( !p.isEditMode ) return;
      if (window.pl.shiftIsPressed) return;      

      const v = window.pl.viewer;
      
      const intersects = v.raycaster.intersectObject( v.panorama, true );
      const theObj = intersects[0]? intersects[0].object : null ;
      if (!theObj || !theObj.type?.startsWith('pl_')) return;
      if (theObj.isBlocked) return;  // blocked object: that obj can't be selected
      if (window.objectLocked && window.objectLocked !== theObj) return; // locking an object (ctr+q). Only that object can be selected

      theObj.distance = v.camera.position.distanceTo(theObj.position);
      window.selectedObj = theObj;
    // console.log('Edit Object cLicked', window.selectedObj.name);
      
      v.OrbitControls.enabled = false;
      window.selectedObj.originalPos = window.selectedObj.position;                
      
      // State: assign lastSelectedObj and update state currentObject3D
      p.selectObject(theObj);
  }

  // --- drop object 
  const handlerDropObject = (event) => {  
      if ( !p.isEditMode || !window.selectedObj) return;
      if (!window.selectedObj.type.startsWith('pl_')) return;
      const v = window.pl.viewer;
      v.OrbitControls.enabled = true;
      // p.singleObject3DToParams(window.selectedObj);
      SyncObject3d__DataHotspot( { 
                  object3D: window.selectedObj,
                  getOptionsByObject3D: p.getOptionsByObject3D, 
                  setPlOptions: p.setPlOptions,
                  plOptionsReplaceWorldParamsHotspot: p.plOptionsReplaceWorldParamsHotspot} );
      window.selectedObj = null;
  };

    return (
        <Row>
          <div className='w-100' onMouseMove={ (e) => reactGetMouse3Dposition(e, { setEditParams: p.setEditParams, editParams: p.editParams } ) }>
           <div  id={p.editParams.POSTERLENS_CONTAINER_ID} className='posterlens-container'></div>
          </div>
        </Row>
    )
}

export default CanvasUI3D
