import React, { useEffect } from 'react'

import Row from 'react-bootstrap/Row'
import {reactGetMouse3Dposition} from '../../helpers';
import { SyncObject3d__DataHotspot } from '../SyncDataAlongApp'

/**
 * The div placeholder where posterlens.js loads the threejs panolens panorama
 */
function CanvasUI3D( p ) {

  // triggered on load, only once.
  useEffect(() => { 
    if (!window.pl) return;
    // console.log('pl updated in edit', window.pl);
    const v = window.pl.viewer;
    v.renderer.domElement.addEventListener('mousedown', (event) => { handlerPickupObject(event) });

    // --- move object 
    v.renderer.domElement.addEventListener('mousemove', function (event) {
        if (!window.selectedObj) return;
        let newPos = reactGetMouse3Dposition(event, { setEditParams: p.setEditParams, editParams: p.editParams })
        if (!newPos) return;
        const v = new window.THREE.Vector3(...newPos).normalize().multiplyScalar(window.selectedObj.distance);
        newPos = [v.x, v.y, v.z];
        window.pl.setObjectPos(window.selectedObj, newPos);
    });
    v.renderer.domElement.addEventListener('mouseup', (event) => { handlerDropObject(event) });
    // document.addEventListener('keydown', (event) => { handlerScaleRotateObject(event) } );
      
  }, [p.plOptions] );

  // --- pickup object 
  const handlerPickupObject = (event) => {
      if ( !p.isEditMode ) return;
      if (window.pl.shiftIsPressed) return;

      const v = window.pl.viewer;
      
      const intersects = v.raycaster.intersectObject( v.panorama, true );
      const theObj = intersects[0]? intersects[0].object : null ;
      if (!theObj || !theObj.type?.startsWith('pl_')) return;

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
