import React, {useEffect, useState, createRef} from 'react';

// the <inputs ...
import InputData from '../Inputs/InputData';
import InputOnClickOption from '../Inputs/InputOnClickOption';
import InputsRotation from '../Inputs/InputsRotation';

import { SyncObject3d__DataHotspot } from '../SyncDataAlongApp'
import { reactGetMouse3Dposition } from '../../helpers';
import { z_move } from './CanvasUI3D';

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

    useEffect(() => { 
        if (!window.pl) return;
        document.addEventListener('keydown', (event) => { handlerScaleRotateObject(event) } );    
    }, [] );

    const handlerScaleRotateObject = function(event) {
        // we cant use the state currentObject3D, because it will not get the latest value. It will be initialzied to the time of creation og this handler
        if (!window.lastSelectedObj) return;
        if (event.ctrlKey) {
            let SCALE_FACTOR    = p.editParams.SCALE_FACTOR * ( event.shiftKey? 2 : 1);
            let ROTATE_DEG      = p.editParams.ROTATE_DEG * ( event.shiftKey? 2 : 1);     
            let MOVE            = 0.5 * ( event.shiftKey? 6 : 1);
            
            if (window.lastSelectedObj.material.type === "SpriteMaterial") {
                // for a sptrite some actions break it.
                if (!['4','5','+','-'].includes(event.key)) return
            }
            switch (event.key) {
                case '+': window.lastSelectedObj.scale.set( window.lastSelectedObj.scale.x * SCALE_FACTOR, window.lastSelectedObj.scale.y * SCALE_FACTOR, window.lastSelectedObj.scale.z * SCALE_FACTOR );      break;
                case '-': window.lastSelectedObj.scale.set( window.lastSelectedObj.scale.x / SCALE_FACTOR, window.lastSelectedObj.scale.y / SCALE_FACTOR, window.lastSelectedObj.scale.z / SCALE_FACTOR );      break;
                case 'r': window.lastSelectedObj.rotation.x = parseInt(100*(window.lastSelectedObj.rotation.x + ROTATE_DEG))/100;  break;
                case 't': window.lastSelectedObj.rotation.x = parseInt(100*(window.lastSelectedObj.rotation.x - ROTATE_DEG))/100;  break;
                case 'f': window.lastSelectedObj.rotation.y = parseInt(100*(window.lastSelectedObj.rotation.y + ROTATE_DEG))/100;  break;
                case 'g': window.lastSelectedObj.rotation.y = parseInt(100*(window.lastSelectedObj.rotation.y - ROTATE_DEG))/100;  break;
                case 'v': window.lastSelectedObj.rotation.z = parseInt(100*(window.lastSelectedObj.rotation.z + ROTATE_DEG))/100;  break;
                case 'b': window.lastSelectedObj.rotation.z = parseInt(100*(window.lastSelectedObj.rotation.z - ROTATE_DEG))/100;  break;
                case '4': z_move(window.lastSelectedObj, 'close'); break;
                case '5': z_move(window.lastSelectedObj, 'far'); break;
                case 'w': case 'W': window.lastSelectedObj.translateY( MOVE );  break;
                case 's': case 'S': window.lastSelectedObj.translateY( -MOVE );  break;
                case 'd': case 'D': window.lastSelectedObj.translateX( MOVE );  break;
                case 'a': case 'A': window.lastSelectedObj.translateX( -MOVE );  break;
                default:
                    break;
            }
            p.setCurrentObject3D(window.lastSelectedObj);
            if (window.waitSave) 
                clearTimeout(window.waitSave);
            window.waitSave = setTimeout( () => {
                SyncObject3d__DataHotspot( { 
                    object3D: window.lastSelectedObj,
                    getOptionsByObject3D: p.getOptionsByObject3D, 
                    setPlOptions: p.setPlOptions,
                    plOptionsReplaceWorldParamsHotspot: p.plOptionsReplaceWorldParamsHotspot} );
                clearTimeout(window.waitSave);
            }, 200);
            
            
        }
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
        { option: 'animatedMap', type: 'number', label:'frames', active: [ 'pl_poster3d' ], deleteIfValue: '' },
        { option: 'animatedMapSpeed', type: 'number', label:'speed', active: [ 'pl_poster3d' ], deleteIfValue: '' },
        { option: 'rotationX', type: 'number', label:'℺ animat', placeholder: 'x', step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'rotationY', type: 'number', label:'', placeholder: 'y',  step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'rotationZ', type: 'number', label:'', placeholder: 'z',  step: 100, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'animated', type: 'select', label:'Glow animation', options: { 'always' : 'always', 'only on hover' : 'hover' }, active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        { option: 'popupWhenVisible', type: 'number', step: 10, label:'Pops up when in camera', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
        ]
    ];
    const inputsCol3 = [
        { option: 'hoverText', type: 'textarea', label:'hoverText', deleteIfValue: '', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'] },
        { option: 'hoverTextClass', type: 'select', options: { type1 : 'type1' }, label:'Hover box style', active: [ 'pl_text-2d', 'pl_poster3d', 'pl_text-3d'], deleteIfValue: '' },
    ]
    return (
      <Container className="edit-panel">
        { /* The name of the object */ }
        {p.currentObject3D? 
        <Row className='no-gutters' style={{ marginTop: '-20px' }}>
            <InputData   input={ { option: 'name', type: 'input', label:'', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'] } } 
                            currentObject3D={p.currentObject3D}
                            getOptionsByObject3D={p.getOptionsByObject3D} 
                            getCurrentPanoramaParams={p.getCurrentPanoramaParams}
                            plOptionsReplaceWorldParamsHotspot={p.plOptionsReplaceWorldParamsHotspot}
                            setPlOptions={p.setPlOptions}
                            selectObject={p.selectObject}
                            setCurrentObject3D={p.setCurrentObject3D}
                            class="col-5 mb-3"
                            />

        { /* The inputs in sync with the 3d object */ }
            <div className='col-7'>
                <InputsRotation  class="row"
                            getCurrentPanoramaParams={p.getCurrentPanoramaParams}
                            currentObject3D={p.currentObject3D} setPlOptions={p.setPlOptions}
                            plOptionsReplaceWorldParamsHotspot={p.plOptionsReplaceWorldParamsHotspot}
                            getOptionsByObject3D={p.getOptionsByObject3D}
                            selectObject={p.selectObject}
                            setCurrentObject3D={p.setCurrentObject3D} />
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
                                                    currentObject3D={p.currentObject3D} setCurrentObject3D={p.setCurrentObject3D}
                                                    getOptionsByObject3D={p.getOptionsByObject3D}
                                                    getCurrentPanoramaParams={p.getCurrentPanoramaParams}
                                                    plOptionsReplaceWorldParamsHotspot={p.plOptionsReplaceWorldParamsHotspot}
                                                    setPlOptions={p.setPlOptions}
                                                    selectObject={p.selectObject}
                            />
                            } )
                        }
                    </Col>
                })
            }
            <Col sm="4" className="border bg-light">
                <label className='d-block h5'>Action</label>
                <InputOnClickOption key={p.getOptionsByObject3D? p.getOptionsByObject3D.name : 'not'} plOptions={p.plOptions} 
                                    currentObject3D={p.currentObject3D}
                                    getOptionsByObject3D={p.getOptionsByObject3D}
                                    onClickOption={p.onClickOption} setOnClickOption={p.setOnClickOption} 
                                    getCurrentPanoramaParams={p.getCurrentPanoramaParams}
                                    plOptionsReplaceWorldParamsHotspot={p.plOptionsReplaceWorldParamsHotspot}
                                    setPlOptions={p.setPlOptions}
                                    selectObject={p.selectObject}
                                    setCurrentObject3D={p.setCurrentObject3D}
                />

                { inputsCol3.map( (input, i) => <InputData  input={input} key={'input-3rd-column-' + i }
                                    currentObject3D={p.currentObject3D}
                                    getOptionsByObject3D={p.getOptionsByObject3D}
                                    onClickOption={p.onClickOption} setOnClickOption={p.setOnClickOption} 
                                    getCurrentPanoramaParams={p.getCurrentPanoramaParams}
                                    plOptionsReplaceWorldParamsHotspot={p.plOptionsReplaceWorldParamsHotspot}
                                    setPlOptions={p.setPlOptions}
                                    selectObject={p.selectObject}
                                    setCurrentObject3D={p.setCurrentObject3D} /> ) }
                
            </Col>
        </Row>
        
        {/* <img width='50' className='use-me' src={ window.basePath+'resources/arboles.png' } /> */}
      </Container>        
  );
}

export default EditObjectControls_Bottom;
