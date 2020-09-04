import React, {useState, useEffect} from 'react';


function EditObject( p ) {

    // Important note. Inside a new EventListener, we can't access to updated props. The props will always have the initial value
    // That's why I use window.selectedObj instead of p.currentObject3D, to access to the lastest Position.

    let v = {};
    useEffect(() => { 
        console.log('pl updated in edit', p.pl);
        v = p.pl.viewer;
        v.renderer.domElement.addEventListener('mousedown', (event) => { handlerPickupObject(event) });
        v.renderer.domElement.addEventListener('mousemove', function (event) {
            if (!window.selectedObj) return;
            const newPos = p.getMouse3Dposition(event, p.pl);
            p.pl.setObjectPos(window.selectedObj, newPos);
        });
        v.renderer.domElement.addEventListener('mouseup', (event) => { handlerDropObject(event) });
        document.addEventListener('keydown', (event) => { handlerScaleRotateObject(event) } );
        
    }, [p.pl] );

    const handlerPickupObject = (event) => {
        if ( !p.isEditMode ) return;
            const intersects = v.raycaster.intersectObject( v.panorama, true );
            const theObj = intersects[0]? intersects[0].object : null ;
            if (!theObj.type.startsWith('pl_')) return;

            window.selectedObj = theObj;
            window.lastSelectedObj = theObj;
            
            if (p.globalVars.stopAllAnimations) p.globalVars.stopAllAnimations(v);
            
            console.log('Edit Object cLicked', window.selectedObj.name);
            
            v.OrbitControls.enabled = false;
            window.selectedObj.originalPos = window.selectedObj.position;                
            
            p.setCurrentObject3D( window.selectedObj );

            p.setCurrentObjectData( window.selectedObj );
            console.log('1', window.selectedObj );
            //window.selectedObj.removeEventListener('click', 'posterlens-handler', false); // DOESNT WORK! the event is backed up safe in obj._click
            // I shoould try window.selectedObj._listeners.click[0]
    }

    const handlerDropObject = (event) => {  
        if ( !p.isEditMode || !window.selectedObj) return;
        if (!window.selectedObj.type.startsWith('pl_')) return;
        v.OrbitControls.enabled = true;        
        updateObjectDataFromObject(window.selectedObj);
        window.selectedObj = null;
        // setTimeout( () => p.setCurrentObject3D(null), 100 );
    };

    const handlerScaleRotateObject = function(event) {
        console.log(window.lastSelectedObj, event.key);
        if (!window.lastSelectedObj) return;
        switch (event.key) {
            case '+': window.lastSelectedObj.scale.set( window.lastSelectedObj.scale.x * p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.y * p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.z * p.editParams.SCALE_FACTOR );      break;
            case '-': window.lastSelectedObj.scale.set( window.lastSelectedObj.scale.x / p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.y / p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.z / p.editParams.SCALE_FACTOR );      break;
            case 'r': window.lastSelectedObj.rotation.z += p.editParams.ROTATE_DEG;  break;
            case 't': window.lastSelectedObj.rotation.z -= p.editParams.ROTATE_DEG;  break;
            case 'f': window.lastSelectedObj.rotation.y += p.editParams.ROTATE_DEG;  break;
            case 'g': window.lastSelectedObj.rotation.y -= p.editParams.ROTATE_DEG;  break;
            case 'v': window.lastSelectedObj.rotation.x += p.editParams.ROTATE_DEG;  break;
            case 'b': window.lastSelectedObj.rotation.x -= p.editParams.ROTATE_DEG;  break;
            default:
                break;
        }
        if (event.key == 'r' || event.key === 't' || event.key === 'f' || event.key === 'g' || event.key === 'v' || event.key === 'b') {
            if (window.lastSelectedObj.constructor.name === 'Infospot')
                p.setInfo('Sprite object cannot be rotated'); 
        }
        updateObjectDataFromObject(window.lastSelectedObj);
    }
    

    const updateObjectDataFromObject = function( object ) {
        
        updateObjectSingleData(object.name, {
            pos: Object.values(object.position),
            rot: [... Object.values(object.rotation)].slice(0,3),
            scale: object.scale.y
        }) 
    }

    const updateObjectSingleData = function( name, fields = {} ) { 
        console.log(`updating ${name}`, fields)
        const currentWorldOptions = p.pl.o.worlds.find( w => w.name === p.pl.viewer.panorama.name );
        const objectHotspotIndex = currentWorldOptions.hotspots.findIndex( ht => ht.name === name );
        if (objectHotspotIndex < 0 ) return;
        let objectData = currentWorldOptions.hotspots.find( ht => ht.name === name );
        const originalName = objectData.name;
        objectData = Object.assign(objectData, fields );
        currentWorldOptions.hotspots[objectHotspotIndex] = objectData;
        p.setCurrentObjectData(objectData);
        p.setWorldOptions(currentWorldOptions);
        if (fields.name) {
            const obj = p.currentObject3D; // in this case I dont have to clone, I want the object to reference the real object in canvas 3d.
            obj.name = fields.name;
            p.setCurrentObjectData(obj);
        }
    }



  return (
    <div className="commands">

      <form onSubmit={ () => false }>
          
          Selected
          <h2 className="ml-3">{ p.currentObject3D? ' ' +p.currentObject3D.name : 'no selection' }</h2>
          <label data-for="name">
              name <input type="text" defaultValue={p.currentObjectData?.name} placeholder="name for object" onKeyUp={ (e) => updateObjectSingleData(p.currentObject3D?.name, { name: e.target.value})   } />
          </label>
          <label data-param="link">
              Link to <input type="text" defaultValue={p.currentObjectData?.link} placeholder="name of panorama" 
                            onKeyUp={ (e) => updateObjectSingleData(p.currentObject3D?.name, { link: e.target.value})   }/>
          </label>
          <label data-for="hoverText">
              Hover Text <textarea placeholder=" ... " defaultValue={p.currentObjectData?.hoverText || ''} 
                        onKeyUp={ (e) => updateObjectSingleData(p.currentObject3D?.name, { hoverText: e.target.value})   }/>
          </label>
          <label data-for="image">
              Image <input type="text" defaultValue={p.currentObjectData?.image} placeholder="url image" 
              onKeyUp={ (e) => updateObjectSingleData(p.currentObject3D?.name, { image: e.target.value})   }/>
              <span className="glyphicon glyphicon-screenshot" aria-hidden="true"></span>
          </label>
          <label data-for="alpha">
              Alpha <input type="text" defaultValue={p.currentObjectData?.alpha || ''} placeholder="url image" 
                        onKeyUp={ (e) => updateObjectSingleData(p.currentObject3D?.name, { alpha: e.target.value})   }/>
          </label>
          <br/>
          <label data-for="pos">

              Pos   { p.currentObject3D?.position.x } { p.currentObject3D?.position.y } { p.currentObject3D?.position.z }
                    
          </label>
          <br/>
          <label data-for="rot">

              Rot   { p.currentObject3D?.rotation.x }  { p.currentObject3D?.rotation.y }  { p.currentObject3D?.rotation.z }

          </label>
          <br/>
          <label data-for="rot">

              Scale   { p.currentObject3D?.scale.y }
                    
                    
          </label>
      </form>
  
  </div>
  );
}

export default EditObject;
