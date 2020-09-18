import React, {useEffect} from 'react';
import InputCommand from './InputCommand';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

function EditObject( p ) {

    // Important note. Inside a new EventListener, we can't access to updated props. The props will always have the initial value
    // That's why I use window.selectedObj instead of p.currentObject3D, to access to the lastest Position.

    // triggered on load, only once.
    useEffect(() => { 
        if (!p.pl) return;
        console.log('pl updated in edit', p.pl);
        const v = p.pl.viewer;
        v.renderer.domElement.addEventListener('mousedown', (event) => { handlerPickupObject(event) });
        v.renderer.domElement.addEventListener('mousemove', function (event) {
            if (!window.selectedObj) return;
            //Object.values(v.camera.getWorldDirection(new p.globalVars.THREE.Vector3()).multiplyScalar(300)), // this normalizes but not to unitary, but to 300 long
            let newPos = p.getMouse3Dposition(event, p.pl);
            const v = new p.globalVars.THREE.Vector3(...newPos).normalize().multiplyScalar(window.selectedObj.distance);
            newPos = [v.x, v.y, v.z];
            p.pl.setObjectPos(window.selectedObj, newPos);
        });
        v.renderer.domElement.addEventListener('mouseup', (event) => { handlerDropObject(event) });
        document.addEventListener('keydown', (event) => { handlerScaleRotateObject(event) } );
        
    }, [p.pl] );

    useEffect(() => { 
        // sync Object Data ===> inputs /  bad practice, I know.. I should use refs.
        Array.from(document.querySelectorAll('.pl-sync-input')).forEach( el => {
            const field = el.getAttribute('data-for');
            if (p.currentObjectData) {

                let val = typeof (p.currentObjectData?.[field]) === 'undefined' ? '' : p.currentObjectData?.[field];
                
                const input = el.querySelector('input, select, textarea');
                if (input) 
                    input.value = val;
                
            }
        } );
    }, [p.currentObjectData] );

    const handlerPickupObject = (event) => {
        if ( !p.isEditMode ) return;
            const v = p.pl.viewer;
            
            const intersects = v.raycaster.intersectObject( v.panorama, true );
            const theObj = intersects[0]? intersects[0].object : null ;
            if (!theObj.type?.startsWith('pl_')) return;

            theObj.distance = v.camera.position.distanceTo(theObj.position);
            window.selectedObj = theObj;
            window.lastSelectedObj = theObj;
                       
            console.log('Edit Object cLicked', window.selectedObj.name);
            
            v.OrbitControls.enabled = false;
            window.selectedObj.originalPos = window.selectedObj.position;                
            
            p.setCurrentObject3D( window.selectedObj );
        
            initCurrentObjectDataFromObject3D( window.selectedObj );
            
    }

    const handlerDropObject = (event) => {  
        if ( !p.isEditMode || !window.selectedObj) return;
        if (!window.selectedObj.type.startsWith('pl_')) return;
        const v = p.pl.viewer;
        v.OrbitControls.enabled = true;        
        updateObjectDataFromViewer(window.selectedObj);
        window.selectedObj = null;
        // setTimeout( () => p.setCurrentObject3D(null), 100 );
    };

    const handlerScaleRotateObject = function(event) {
        // we cant use the state currentObject3D, because it will not get the latest value. It will be initialzied to the time of creation og this handler
        if (!window.lastSelectedObj) return;
        if (event.ctrlKey) {
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
            if (event.key === 'r' || event.key === 't' || event.key === 'f' || event.key === 'g' || event.key === 'v' || event.key === 'b') {
                if (window.lastSelectedObj.constructor.name === 'Infospot')
                    p.setInfo('Sprite object cannot be rotated'); 
            }
            p.setCurrentObject3D(window.lastSelectedObj);
            updateObjectDataFromViewer(window.lastSelectedObj);
        }
    }
    

    const initCurrentObjectDataFromObject3D = (object3D = null) => {
        if (!object3D) object3D = p.currentObject3D;
        // now the datamodel in params.
        const currentWorldOptions = p.pl.o.worlds.find( w => w.name === p.pl.viewer.panorama.name );
        const objectHotspotIndex = currentWorldOptions.hotspots.findIndex( ht => ht.name === object3D?.name );
        if (objectHotspotIndex < 0 ) return;
        let objectData = currentWorldOptions.hotspots[objectHotspotIndex];
        p.setCurrentObjectData( objectData );
        //window.selectedObj.removeEventListener('click', 'posterlens-handler', false); // DOESNT WORK! the event is backed up safe in obj._click
        // I shoould try window.selectedObj._listeners.click[0]
    }
    
    // when the object is moved/scaled/rotated in the viewer, we need to update the data.
    // Update from Object 3D ===> Object Data
    const updateObjectDataFromViewer = function( object ) {
        
        updateObjectSingleData(object.name, {
            pos: Object.values(object.position),
            rot: [...Object.values(object.rotation)].slice(0,3),
            scale: object.scale.y
        }) 
    }

    // given name of object and updated fields in the way { link : "Hall" }, we update the p.currentObjectData and the worldOptions
    // in some cases, sync the 3d model with the new data in the case of the name.
    const updateObjectSingleData = function( name, fields = {} ) { 
        console.log(`updating ${name}`, fields)
        const currentWorldOptions = p.pl.o.worlds.find( w => w.name === p.pl.viewer.panorama.name );
        const objectHotspotIndex = currentWorldOptions.hotspots.findIndex( ht => ht.name === name );
        if (objectHotspotIndex < 0 ) return;
        let objectData = currentWorldOptions.hotspots.find( ht => ht.name === name );
        objectData = Object.assign(objectData, fields );
        currentWorldOptions.hotspots[objectHotspotIndex] = objectData;
        p.setCurrentObjectData(objectData);
        p.setWorldOptions( Object.assign({}, currentWorldOptions ));

        // now we sync the fields from Data ===> object 3D
        if (!p.currentObject3D) return;
        const obj = p.currentObject3D; // in this case I dont have to clone, I want the object to reference the real object in canvas 3d.
        if (fields.name) { 
            obj.name = fields.name;
            p.setCurrentObject3D(obj);
        }
        if (fields.pos) {
            obj.position.set(...fields.pos);
            p.setCurrentObject3D(obj);
        }
        if (fields.rot) {
            obj.rotation.set(...fields.rot);
            p.setCurrentObject3D(obj);
        }
        if (fields.scale) {
            const ratio = obj.scale.y/obj.scale.x;
            obj.scale.set(fields.scale,fields.scale * ratio ,fields.scale);
            p.setCurrentObject3D(obj);
        }
        if (fields.hasOwnProperty("alwaysLookatCamera")) {
            obj.alwaysLookatCamera = fields.alwaysLookatCamera;
            p.setCurrentObject3D(obj);
        }
    }

    const removeObject = function(object) {
        p.pl.viewer.panorama.remove( object );
        p.pl.viewer.panorama.remove( p.pl.viewer.scene.getChildByName(object.name) ); // just in case (somethimes it doesn delete)
    }
    const removeHotspot = function( name ) {
        
        const objectHotspotIndex = p.worldOptions.hotspots.findIndex( ht => ht.name === p.currentObjectData.name );
        p.worldOptions.hotspots.splice(objectHotspotIndex, 1);
        p.setWorldOptions( Object.assign( {}, p.worldOptions ) );
        p.setCurrentObjectData(null);
    }

    const inputCommands = [
        { attrName: 'name', inputType: 'text', label: 'Name'  },
        { attrName: 'link', inputType: 'select', label: 'Link', onlyActive: ['poster3d', 'poster-sprite'], options: p.pl?.viewer.scene.children.map( pano => pano.name  ) },
        { attrName: 'animated', inputType: 'select', label: 'Animation', options: { 'none' : '', 'on hover' : 'hover', 'always' : 'always' } },
        { attrName: 'hoverText', inputType: 'textarea', label: 'Hovertext', onlyActive: ['poster3d', 'poster-sprite']},
        { attrName: 'image', inputType: 'image', label: 'Image', callbackUpdate: (fields)=> { 
            p.currentObject3D.material.map.image.src=fields.image; 
            p.currentObject3D.material.needsUpdate = true; p.currentObject3D.material.map.needsUpdate = true;
        } , onlyActive: ['poster3d', 'poster-sprite']},
        { attrName: 'alpha', inputType: 'image', label: 'Alpha', callbackUpdate: (fields)=> { 
            if (fields.alpha) {
                const loader = new p.globalVars.THREE.TextureLoader();
                const alphaMap = loader.load( fields.alpha );
                const material = p.currentObject3D.material;
                material.alphaMap = alphaMap;
                material.transparent = true;
                material.depthTest = false;
                material.needsUpdate = true; if (material.map) material.map.needsUpdate = true;
            }
        }, onlyActive: ['poster3d' ] },
        { attrName: 'text', inputType: 'text', label: 'Text', regenerateObject: true, onlyActive: ['text-2d', 'text-3d'] },
        // { attrName: 'pos', subattribute: 0, inputType: 'range', min: -500, max: 500, label: 'pos X' },
        // { attrName: 'pos', subattribute: 1, inputType: 'range', min: -500, max: 500, label: 'pos Y' },
        // { attrName: 'pos', subattribute: 2, inputType: 'range', min: -500, max: 500, label: 'pos Z' },
        // { attrName: 'alwaysLookatCamera', inputType: 'select', label: 'Always facing to the camera', onlyActive: ['text-2d', 'text-3d', 'poster3d'], options: { 'Yes' : true, 'No (you set the rotation)' : false } },
        { attrName: 'alwaysLookatCamera', inputType: 'checkbox', label: 'Always facing to the camera', onlyActive: ['text-2d', 'text-3d', 'poster3d']},
        { attrName: 'animatedMap', inputType: 'number', label: 'Animated map (sprite)', onlyActive: ['poster3d'], regenerateObject: true },
        { attrName: 'animatedMapSpeed', inputType: 'range', min: 1, max: 100, label: '(speed)', onlyActive: ['poster3d'], regenerateObject: true },
        { attrName: 'rot', subattribute: 0, inputType: 'range', min: -Math.PI, max: Math.PI, step: 0.1, label: 'rot X', onlyActive: ['text-2d', 'text-3d', 'poster3d'] },
        { attrName: 'rot', subattribute: 1, inputType: 'range', min: -Math.PI, max: Math.PI, step: 0.1, label: 'rot Y', onlyActive: ['text-2d', 'text-3d', 'poster3d'] },
        { attrName: 'rot', subattribute: 2, inputType: 'range', min: -Math.PI, max: Math.PI, step: 0.1, label: 'rot Z', onlyActive: ['text-2d', 'text-3d', 'poster3d'] },
        { attrName: 'scale', inputType: 'range', min: 0.1, max: 1000, step: 1, label: 'scale' },
        
    ];
  return (
    <div className="commands">

      <Container>

        <Row>
            <small className='col-12'>(Data) {p.currentObjectData?.name} ({p.currentObjectData?.type})</small>
            <Col xs="9">
                <h2>{ p.currentObject3D? ' ' +p.currentObject3D.name : 'no selection' }</h2> 
            </Col>
            { (p.currentObjectData?.name) ?
                 <Button variant="outline-danger" className="col-3" onClick={ (e)=> { removeHotspot(p.currentObjectData.name); removeObject(p.currentObject3D);  } } >Remove</Button>
            : null }

            { p.currentObject3D? <React.Fragment>
                <Button variant="primary" onClick={ (e) => {
                    const offset = 1.1;
                    
                    var newPos = p.currentObject3D.position.clone();
                    newPos.x *= offset; newPos.y *= offset; newPos.z *= offset;
                    if (p.pl.viewer.camera.position.distanceTo(newPos) > 500 ) {
                        console.warn('we cant move that far. Its mor than 500m');
                        return
                    }
                    p.pl.setObjectPos(p.currentObject3D, [newPos.x, newPos.y, newPos.z]);
                    p.setCurrentObject3D(p.currentObject3D);
                    
                  }} >
                    <span role="img" aria-label="Snowman">⬇️</span>
                </Button>
                <Button variant="primary" onClick={ (e) => {
                    const offset = 1.1;
                    
                    var newPos = p.currentObject3D.position.clone();
                    newPos.x /= offset; newPos.y /= offset; newPos.z /= offset;
                    if (p.pl.viewer.camera.position.distanceTo(newPos) < 100 ) {
                        console.warn('we cant move that close. Its less than 100m');
                        return
                    }
                    p.pl.setObjectPos(p.currentObject3D, [newPos.x, newPos.y, newPos.z]);
                    p.setCurrentObject3D(p.currentObject3D);
                    
                  }} >
                    <span role="img" aria-label="Snowman">⬇️</span>
                </Button>
            
            </React.Fragment>
             : null }
        </Row>

            { p.currentObject3D? inputCommands.map( fields => {
                if (fields.onlyActive && (!p.currentObjectData || !fields.onlyActive.includes(p.currentObjectData.type)) ) return null;
                return <InputCommand  fields={fields}  currentObjectData={p.currentObjectData} currentObject3D={p.currentObject3D} updateObjectSingleData={updateObjectSingleData} 
                                 removeObject={removeObject} pl={p.pl} key={fields.attrName + (fields.subattribute?? null )}
                                />
                }
            ) : null }

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
          <img width='100' alt="" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Feuerwehrhaus_Zammerberg.jpg/1280px-Feuerwehrhaus_Zammerberg.jpg"></img>
          <img width='100' alt="" src="https://images.unsplash.com/photo-1428606381429-22224991fb0c"></img>
          <img width='100' alt="" src="https://images.unsplash.com/photo-1529432337323-223e988a90fb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=666&q=80"></img>
          <img width='100' alt="" src="posterlens/assets/level2.png"></img>
          <img width='100' alt="" src="resources/mountains.png"></img>
          <img width='100' alt="" src="resources/natura.png"></img>
          <img width='100' alt="" src="resources/natura-mask.jpg"></img>
          <img width='100' alt="" src="resources/arboles.png"></img>
          <img width='100' alt="" src="resources/casita.png"></img>
          <img width='100' alt="" src="resources/mujer.png"></img>
          <img width='100' alt="" src="resources/mujer-animada.png"></img>
      </Container>
        
  </div>
  );
}

export default EditObject;
