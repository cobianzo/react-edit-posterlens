import React, { useState, useEffect, useRef } from 'react'

import InputData from './InputData';

import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

function InputOnClickOption( p ) {

    // using p.onClickOption and p.setOnClickOption. Those states are defined in parent.
    const selectRef = useRef(null);
    

    const handleSelectOption = (value) => {
        if (!p.currentObject3D) return
        p.setOnClickOption(value);
        
        const updatedFields = { onClickAction : value }
        if ( ['pano', 'url', '' ].includes(value) ) 
            updatedFields.modal = null;
        if ( ['iframe', 'card', '' ].includes(value) ) 
            updatedFields.link = null;
        
        p.updateObjectSingleData( p.currentObject3D.name, updatedFields );
    }
    
    const panoList = {}; // for the `link` option below
    if (p.plOptions)
        p.plOptions.worlds.forEach( world => panoList[world.name] = world.name  );    
    
    let cardList = {};
    if (window?.cardListCallback) {
        //        console.log('loading cardList callback', window.cardListCallback());
        cardList = window.cardListCallback();
    }
    

    if (!p.currentObject3D) return null;

    return (
        <div>
            <InputGroup sync-3d='onClickAction'>
                <InputGroup.Prepend> <InputGroup.Text>On click action</InputGroup.Text></InputGroup.Prepend>
                <FormControl as='select' defaultValue={ p.getOptionsByObject3D(p.currentObject3D, 'onClickAction') }
                                onChange={ (e) => handleSelectOption(e.target.value) } ref={selectRef} >
                        <option key='nothing' value='' >---</option>
                        <option value='pano'> Link to panorama</option>
                        <option value='url'> Link to URL</option>
                        <option value='iframe'> iframe popup</option>
                        <option value='card'> Card</option>
                </FormControl>
            </InputGroup>
            
            
            { p.onClickOption? 
                <div>
                    <div>{ p.onClickOption }</div>
                    { /** LINK TO PANORAMA */
                    
                    p.onClickOption === 'pano' ? 
                        <InputData  input={ { option: 'link', type: 'select', options: panoList, label:'PANORAMA', deleteIfValue: '', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'] } } 
                                    updateObjectSingleData={p.updateObjectSingleData} 
                                    currentObject3D={p.currentObject3D}
                                    getOptionsByObject3D={p.getOptionsByObject3D} />
                                    : null}

                    { /** LINK TO URL */ 
                    p.onClickOption === 'url' ? <div>
                            <InputData  input={ { option: 'link', type: 'input',  label:'url', deleteIfValue: '', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'] } } 
                                    updateObjectSingleData={p.updateObjectSingleData} 
                                    currentObject3D={p.currentObject3D}
                                    getOptionsByObject3D={p.getOptionsByObject3D} />
                        </div> : null 
                    }

                    { /** LINK TO IFRAME */ 
                    p.onClickOption === 'iframe' ? <div>
                    <InputData  input={ { option: 'modal', type: 'input', label:'iframe url', deleteIfValue: '', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'] } } 
                            updateObjectSingleData={p.updateObjectSingleData} 
                            currentObject3D={p.currentObject3D}
                            getOptionsByObject3D={p.getOptionsByObject3D} />
                        </div> : null 
                    }

                    { /** CARD TO OPEN */ 
                    p.onClickOption === 'card' ? <div>
                    <InputData  input={ { option: 'modal', type: 'select', options: cardList, label:'Modal Card', deleteIfValue: '', active: [ 'pl_poster3d', 'pl_text-2d', 'pl_text-3d'] } } 
                            updateObjectSingleData={p.updateObjectSingleData} 
                            currentObject3D={p.currentObject3D}
                            getOptionsByObject3D={p.getOptionsByObject3D} />
                        </div> : null 
                    }
                     
                </div>        
            : null }
        </div>
    )
}

export default InputOnClickOption;
