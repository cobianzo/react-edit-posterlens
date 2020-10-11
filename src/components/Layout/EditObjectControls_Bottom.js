import React, {useEffect, useState, createRef} from 'react';

// the <inputs ...
import InputData from '../InputData';
import InputOnClickOption from '../InputOnClickOption';
import InputsRotation from '../InputsRotation';

// bootstrap 4 elements
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

function EditObjectControls_Bottom( p ) {

    const [imgPath, setImgPath] = useState( window.plImgPath?? 'resources/'); // imgs for 3d textures
    const refImgPathInput = createRef();

    // Important note. Inside a new EventListener, we can't access to updated props. The props will always have the initial value
    // That's why I use window.selectedObj instead of p.currentObject3D, to access to the lastest Position.

    // triggered on load, only once.
    useEffect(() => { 
        if (!window.pl) return;
        // console.log('pl updated in edit', window.pl);
        const v = window.pl.viewer;
        v.renderer.domElement.addEventListener('mousedown', (event) => { handlerPickupObject(event) });

        // --- move object 
        v.renderer.domElement.addEventListener('mousemove', function (event) {
            if (!window.selectedObj) return;
            let newPos = p.reactGetMouse3Dposition(event, window.pl);
            if (!newPos) return;
            const v = new window.THREE.Vector3(...newPos).normalize().multiplyScalar(window.selectedObj.distance);
            newPos = [v.x, v.y, v.z];
            window.pl.setObjectPos(window.selectedObj, newPos);
        });
        v.renderer.domElement.addEventListener('mouseup', (event) => { handlerDropObject(event) });
        document.addEventListener('keydown', (event) => { handlerScaleRotateObject(event) } );
        
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
        p.singleObject3DToParams(window.selectedObj);
        window.selectedObj = null;
    };

    const handlerScaleRotateObject = function(event) {
        // we cant use the state currentObject3D, because it will not get the latest value. It will be initialzied to the time of creation og this handler
        if (!window.lastSelectedObj) return;
        if (event.ctrlKey) {
            switch (event.key) {
                case '+': window.lastSelectedObj.scale.set( window.lastSelectedObj.scale.x * p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.y * p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.z * p.editParams.SCALE_FACTOR );      break;
                case '-': window.lastSelectedObj.scale.set( window.lastSelectedObj.scale.x / p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.y / p.editParams.SCALE_FACTOR, window.lastSelectedObj.scale.z / p.editParams.SCALE_FACTOR );      break;
                case 'r': window.lastSelectedObj.rotateZ(p.editParams.ROTATE_DEG);  break;
                case 't': window.lastSelectedObj.rotateZ(-p.editParams.ROTATE_DEG);  break;
                case 'f': window.lastSelectedObj.rotateY(p.editParams.ROTATE_DEG);  break;
                case 'g': window.lastSelectedObj.rotateY(-p.editParams.ROTATE_DEG);  break;
                case 'v': window.lastSelectedObj.rotateX(p.editParams.ROTATE_DEG);  break;
                case 'b': window.lastSelectedObj.rotateX(-p.editParams.ROTATE_DEG);  break;
                case '4': z_move(window.lastSelectedObj, 'close'); break;
                case '5': z_move(window.lastSelectedObj, 'far'); break;
                default:
                    break;
            }
            if (event.key === 'r' || event.key === 't' || event.key === 'f' || event.key === 'g' || event.key === 'v' || event.key === 'b') {
                if (window.lastSelectedObj.constructor.name === 'Infospot') // deprecated
                    p.setInfo('Sprite object cannot be rotated'); 
            }
            p.setCurrentObject3D(window.lastSelectedObj);
            if (window.waitSave) 
                clearTimeout(window.waitSave);
            window.waitSave = setTimeout( () => {
                p.singleObject3DToParams(window.lastSelectedObj);
                clearTimeout(window.waitSave);
                p.setInfo('updated');
            }, 200);
            
            
        }
    }

    // move an object closer or farther from the camera.
    function z_move(object3D, direction = 'close'){
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

    
    const panoList = {}; // for the `link` option below
    if (p.plOptions)
        p.plOptions.worlds.forEach( world => panoList[world.name] = world.name  );
    const inputs = [
        [
            { option: 'image', type: (p.appAsWidget? 'image-pick' : 'image'), label:'Img', active: [ 'pl_poster3d' ], deleteIfValue:'' },
            { option: 'alpha', type: (p.appAsWidget? 'image-pick' : 'image'), label:'Alpha', active: [ 'pl_poster3d' ], deleteIfValue:'' },
            { option: 'text', type: 'input', label:'Text', active: [ 'pl_text-2d', 'pl_text-3d'] },
            { option: 'emissive', type: 'color', label:'Emissive Color', active: [ 'pl_text-3d'], deleteIfValue:'#ffffff' },
            { option: 'color', type: 'color', label:'Text Color', active: [ 'pl_text-2d'], deleteIfValue:'#ffffff' },
            { option: 'background', type: 'color', label:'Background', active: [ 'pl_text-2d'], deleteIfValue:'#000000' },
            // TODO: we need to give an option for bg transparent 
            { option: 'alwaysLookatCamera', type: 'checkbox', label:'alwaysLookatCamera', checkedValue: () => true, uncheckedValue: () => false, active: [ 'pl_text-2d', 'pl_text-3d', 'pl_poster3d' ], deleteIfValue: true },
            { option: 'sprite', type: 'checkbox', label:'sprite 2D', checkedValue: () => true, uncheckedValue: () => null, active: [ 'pl_text-2d', 'pl_poster3d' ], deleteIfValue: false },
            { option: 'posterSphere', type: 'checkbox', label:'is sphere', checkedValue: () => true, uncheckedValue: () => null, active: [ 'pl_text-2d', 'pl_poster3d' ], deleteIfValue: false },
            //{ option: 'link', type: 'select', options: panoList, label:'Go to pano', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
            //{ option: 'modal', type: 'input', label:'modal', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'], deleteIfValue:'' },
            { option: 'opacity', type: 'number', step: 0.05, min:0, max:1, label:'Opacity', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '1' },
        ],
        [
        { option: 'animatedMap', type: 'number', label:'frames map', active: [ 'pl_poster3d' ], deleteIfValue: '' },
        { option: 'animatedMapSpeed', type: 'number', label:'speed', active: [ 'pl_poster3d' ], deleteIfValue: '' },
        { option: 'rotationX', type: 'number', label:'Rotate animat', placeholder: 'x', step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'rotationY', type: 'number', label:'', placeholder: 'y',  step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'rotationZ', type: 'number', label:'', placeholder: 'z',  step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'animated', type: 'select', label:'Glow animation', options: { 'always' : 'always', 'only on hover' : 'hover' }, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'popupWhenVisible', type: 'number', step: 10, label:'Pops up when in camera', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        ]
    ];
    return (
      <Container className="edit-panel">
        { /* The name of the object */ }
        {p.currentObject3D? 
        <Row>
            <InputData   input={ { option: 'name', type: 'input', label:'', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'] } } 
                            updateObjectSingleData={p.updateObjectSingleData} 
                            currentObject3D={p.currentObject3D}
                            getOptionsByObject3D={p.getOptionsByObject3D} 
                            class="col-3"
                            />

        { /* The inputs in sync with the 3d object */ }
            <div className='col-9'>
                <InputsRotation  class="row"
                            updateObjectSingleData={p.updateObjectSingleData} 
                            getCurrentPanoramaParams={p.getCurrentPanoramaParams}
                            currentObject3D={p.currentObject3D}
                            getOptionsByObject3D={p.getOptionsByObject3D} />
            </div>
        </Row> : null }        

        { /* The imgs path (not needed anymore) */}
        { !p.appAsWidget?
        <InputGroup>
            <InputGroup.Prepend> <InputGroup.Text>imgs path</InputGroup.Text></InputGroup.Prepend>
            <FormControl as='input' defaultValue={imgPath} ref={refImgPathInput} 
                        onChange={ (e) => refImgPathInput.current? setImgPath(refImgPathInput.current.value) : null } />
            <InputGroup.Append><InputGroup.Text> {imgPath} </InputGroup.Text> </InputGroup.Append>
        </InputGroup> : null }

        <Row>
            {   /**  */
                inputs.map( (inputsCol, col_i) => {
                    return <Col sm='4' className='border bg-light' key={'column-'+col_i}>
                        <label className='d-block h5'>{ col_i === 0 ? 'Main props' : 'Animation' }</label>
                        { 
                            inputsCol.map( (input, i) => {
                                if ( !p.currentObject3D ) return null;
                                if ( !input.active.includes(p.currentObject3D.type) ) return null;
                                return <InputData   input={input} imgPath={imgPath} key={'input-'+i}
                                                    updateObjectSingleData={p.updateObjectSingleData} 
                                                    currentObject3D={p.currentObject3D} setCurrentObject3D={p.setCurrentObject3D}
                                                    getOptionsByObject3D={p.getOptionsByObject3D} />
                            } )
                        }
                    </Col>
                })
            }
            <Col sm="4">
                <InputOnClickOption key={p.getOptionsByObject3D? p.getOptionsByObject3D.name : 'not'} plOptions={p.plOptions} updateObjectSingleData={p.updateObjectSingleData} 
                                    currentObject3D={p.currentObject3D}
                                    getOptionsByObject3D={p.getOptionsByObject3D}
                                    onClickOption={p.onClickOption} setOnClickOption={p.setOnClickOption} 
                />
            </Col>
        </Row>
        
        {/* <img width='50' className='use-me' src={ window.basePath+'resources/arboles.png' } /> */}
      </Container>        
  );
}

export default EditObjectControls_Bottom;
