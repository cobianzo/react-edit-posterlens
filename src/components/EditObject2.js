import React, {useEffect, useState, createRef} from 'react';

import InputData from './InputData';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

function EditObject2( p ) {

    const [imgPath, setImgPath] = useState( window.plImgPath?? 'resources/'); // imgs for 3d textures
    const refImgPathInput = createRef();

    // Important note. Inside a new EventListener, we can't access to updated props. The props will always have the initial value
    // That's why I use window.selectedObj instead of p.currentObject3D, to access to the lastest Position.

    // triggered on load, only once.
    useEffect(() => { 
        if (!window.pl) return;
        console.log('pl updated in edit', window.pl);
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
        if (!theObj.type?.startsWith('pl_')) return;

        theObj.distance = v.camera.position.distanceTo(theObj.position);
        window.selectedObj = theObj;
        console.log('Edit Object cLicked', window.selectedObj.name);
        
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
                case 'r': window.lastSelectedObj.rotation.z += p.editParams.ROTATE_DEG;  break;
                case 't': window.lastSelectedObj.rotation.z -= p.editParams.ROTATE_DEG;  break;
                case 'f': window.lastSelectedObj.rotation.y += p.editParams.ROTATE_DEG;  break;
                case 'g': window.lastSelectedObj.rotation.y -= p.editParams.ROTATE_DEG;  break;
                case 'v': window.lastSelectedObj.rotation.x += p.editParams.ROTATE_DEG;  break;
                case 'b': window.lastSelectedObj.rotation.x -= p.editParams.ROTATE_DEG;  break;
                case '4': z_move(window.lastSelectedObj, 'close'); break;
                case '5': z_move(window.lastSelectedObj, 'far'); break;
                default:
                    break;
            }
            if (event.key === 'r' || event.key === 't' || event.key === 'f' || event.key === 'g' || event.key === 'v' || event.key === 'b') {
                if (window.lastSelectedObj.constructor.name === 'Infospot')
                    p.setInfo('Sprite object cannot be rotated'); 
            }
            p.setCurrentObject3D(window.lastSelectedObj);
            if (window.waitSave) {
                clearTimeout(window.waitSave);
                window.waitSave = setTimeout( () => {
                    p.singleObject3DToParams(window.lastSelectedObj);
                    clearTimeout(window.waitSave);
                    p.setInfo('updated');
                }, 500);
            }
            
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
            { option: 'image', type: 'image', label:'Img', active: [ 'pl_poster3d' ], deleteIfValue:'' },
            { option: 'alpha', type: 'image', label:'Alpha', active: [ 'pl_poster3d' ], deleteIfValue:'' },
            { option: 'text', type: 'input', label:'Text', active: [ 'pl_text-2d', 'pl_text-3d'] },
            
            { option: 'background', type: 'input', label:'bg color (#ffffff)', active: [ 'pl_text-2d' ] },
            { option: 'alwaysLookatCamera', type: 'checkbox', label:'alwaysLookatCamera', checkedValue: () => true, uncheckedValue: () => false, active: [ 'pl_text-2d', 'pl_text-3d', 'pl_poster3d' ], deleteIfValue: true },
            { option: 'sprite', type: 'checkbox', label:'sprite 2D', checkedValue: () => true, uncheckedValue: () => null, active: [ 'pl_text-2d', 'pl_poster3d' ], deleteIfValue: false },
            { option: 'posterSphere', type: 'checkbox', label:'is sphere', checkedValue: () => true, uncheckedValue: () => null, active: [ 'pl_text-2d', 'pl_poster3d' ], deleteIfValue: false },
            { option: 'link', type: 'select', options: panoList, label:'Go to pano', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
            { option: 'modal', type: 'input', label:'modal', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'], deleteIfValue:'' },
            { option: 'opacity', type: 'number', step: 0.05, label:'Opacity', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '1' },
        ],
        [
        { option: 'animatedMap', type: 'number', label:'frames animation map', active: [ 'pl_poster3d' ], deleteIfValue: '' },
        { option: 'animatedMapSpeed', type: 'number', label:'speed', active: [ 'pl_poster3d' ], deleteIfValue: '' },
        { option: 'rotationX', type: 'number', label:'Rotate anim X', step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'rotationY', type: 'number', label:'Rotate anim Y', step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'rotationZ', type: 'number', label:'Rotate anim Z', step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'animated', type: 'select', label:'Glow animation', options: { 'always' : 'always', 'only on hover' : 'hover' }, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'popupWhenVisible', type: 'number', step: 10, label:'Pops up when in camera', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        ]
    ];
    return (
      <Container>
        {p.currentObject3D? 
        <div className="position-absolute" style={{ marginTop: '-30px'}}>
            <span role="img" aria-label='c'>⬆️</span>
            { p.getOptionsByObject3D(p.currentObject3D, 'name') } <small>{p.getOptionsByObject3D(p.currentObject3D, 'type')}</small>
            <form className='float-left' onSubmit={ (e)=> { 
                e.preventDefault();
                const value = e.currentTarget.querySelector('input').value;
                p.updateObjectSingleData( p.currentObject3D.name, { name: value} );
                }}>
            <FormControl as='input' defaultValue={ p.getOptionsByObject3D(p.currentObject3D, 'name') } />
            </form>
        </div> : null }
            
        <InputGroup>
            <InputGroup.Prepend> <InputGroup.Text>imgs path</InputGroup.Text></InputGroup.Prepend>
            <FormControl as='input' defaultValue={imgPath} ref={refImgPathInput} 
                        onChange={ (e) => refImgPathInput.current? setImgPath(refImgPathInput.current.value) : null } />
            <InputGroup.Append><InputGroup.Text> {imgPath} </InputGroup.Text> </InputGroup.Append>
        </InputGroup>
        <Row>
            {
                inputs.map( (inputsCol, col_i) => {
                    return <Col sm='6' key={'column-'+col_i}>
                        { 
                            inputsCol.map( (input, i) => {
                                if ( !p.currentObject3D ) return null;
                                if ( !input.active.includes(p.currentObject3D.type) ) return null;
                                return <InputData   input={input} imgPath={imgPath} key={'input-'+i}
                                                    updateObjectSingleData={p.updateObjectSingleData} 
                                                    currentObject3D={p.currentObject3D}
                                                    getOptionsByObject3D={p.getOptionsByObject3D} />
                            } )
                        }
                    </Col>
                })
            }
        </Row>
        

      </Container>        
  );
}

export default EditObject2;
