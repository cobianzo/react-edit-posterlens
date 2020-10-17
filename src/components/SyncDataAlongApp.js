import React from 'react'
import { round2 } from '../helpers'



/**
 * No render, only functions
 */



  // updates plOptions (the js object with all the config to load posterlens).
  // updates the react state and the localstorage (it can be used outside of react). It also uses a callback that can be used outside react.
  export function SyncPlOptions__LocalStorage(plOptions, setPlOptions) {
    setPlOptions(plOptions);
    var exportStr = JSON.stringify(plOptions, false, 2);
    localStorage.setItem('pl.o', exportStr);
    if (window.onSavePlOptionsCallback) window.onSavePlOptionsCallback(plOptions); // this fn is passed from outside react, and it can be useful
    return exportStr;
  }


 /* 
  * WHAT: SYNCs  Object 3D ====> Inputs  !SHABBY WAY!
  * WHEN: every time we select a new object, either picking it up on the Canvas UI or in the List f hotspots Left Panel
  * called in AppEditPosterlens.js
  */
export function SyncObject3d__Inputs( p ) {

    /**
     * currentObject3D
     * getOptionsByObject3D
     * setOnClickOption
     */
    // grab the options for the current selected object.
    const options = p.getOptionsByObject3D(p.currentObject3D);
    
    const formsSync = document.querySelectorAll('[sync-3d]');
    
    // for every input, we grab its data `option` from the plOptions hotspot and update the input value.
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

      if (option === 'onClickAction' && p.setOnClickOption ) { // special case. InputOnClickOption: This field handles a state that needs to be updated
        p.setOnClickOption(value);
      }

      // special case: distance
      if (option === 'distance')
        formEl.querySelector('input').value = window.pl.viewer.camera.position.distanceTo(p.currentObject3D.position)
    });
}


  // Object 3d in viewer (rot or scale) ===> Options in pl.
  // =======================> Options pl
  // WHERE: when finishing dragging an object in UI, change its properties with keyboard shortcut, or change properies from InputsRotation
  export function SyncObject3d__DataHotspot( p ) {
  

    const object3D = p.object3D;
    const objectCurrentParams = p.getOptionsByObject3D(object3D); // worldParams.hotspots[objectHotspotIndex];
    const objectNewParams     = { ...objectCurrentParams };

    if (!objectCurrentParams) { alert('error: no objectCP'); return; }
    // pos, scale and rot
    objectNewParams.pos = [ round2(object3D.position.x), round2(object3D.position.y), round2(object3D.position.z) ];
    objectNewParams.rot = [ round2(object3D.rotation.x), round2(object3D.rotation.y), round2(object3D.rotation.z) ];
    // if (object3D.name === 'TEST') debugger
    objectNewParams.scale = round2(object3D.scale.x);  

    const newOptions = p.plOptionsReplaceWorldParamsHotspot(object3D.name, objectNewParams);
    SyncPlOptions__LocalStorage(newOptions, p.setPlOptions);
    
    if (p.regenerate)
        regenerateObject(object3D, objectNewParams, (obj) => { p.selectObject(obj) } );

    return objectNewParams;

  }


  // args (inputs) ===> Options data
    // given name of object and updated fields in the way { link : "Hall" }, we update the p.currentObjectData and the worldOptions
    // in some cases, sync the 3d model with the new data (in the case of the `name`).
  export function SyncInputFieldset__DataHotspot( name, fields = {}, regenerate = true, p ) {
    /*  p.getCurrentPanoramaParams,
        p.plOptionsReplaceWorldParamsHotspot,
        p.setPlOptions,
        p.selectObject,
        p.setCurrentObject3D 
    */


    const currentWorldOptions = p.getCurrentPanoramaParams();
    let objectHotspotIndex = currentWorldOptions.hotspots.findIndex( ht => ht.name === name );
    if (objectHotspotIndex < 0 ) return;
    // update the field
    let objectData = currentWorldOptions.hotspots.find( ht => ht.name === name ); // all fields => { name: '', type: '' ... }
    objectData = Object.assign({}, objectData, fields );
    Object.keys(objectData).forEach( k =>  (objectData[k] === null)? delete(objectData[k]) : false ); // cleanup
    const newPlOptions = p.plOptionsReplaceWorldParamsHotspot(name, objectData);
    SyncPlOptions__LocalStorage(newPlOptions, p.setPlOptions);
    
    // regenerate the 3d object (remove and generate)
    const object = window.pl.getObjectByName(name);
    if (regenerate) {
      regenerateObject(object, objectData, (obj) => { p.selectObject(obj) } );
    } // end regenrate

    // special field: name. TODO: check name is not repeated.
    if ( object && fields.hasOwnProperty('name') ) {
      object.name = fields.name;
      p.setCurrentObject3D(object);
    }

  }


  // helper
  function regenerateObject(object, objectData = null, callbackFn = null) {
    if (!object) return false;
    const name = object.name;
    // if (!objectData) objectData = p.getOptionsByObject3D(object)
    if (window.pl.viewer.panorama && objectData ) {
        window.pl.viewer.panorama.remove( object );
        objectData.creationCallback = callbackFn;
        window.pl.createNewObjectFromParams(window.pl.viewer.panorama, objectData); // recreate the 3d in the viewer
      }
      else {
        if (callbackFn)
            callbackFn(object);
      }
  }