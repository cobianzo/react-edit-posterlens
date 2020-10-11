import React, { useState, useEffect, useRef } from 'react'
/**
 * Represent an <input> in sync with props of the current3DObject inside the Canvas, which will also update the data in plOptions.  
 * The difference with InputData is that InputData is in sync only with the datamodel (the plOptions) of the current selected object.
 */

import { SyncObject3d__DataHotspot } from '../SyncDataAlongApp'

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function InputObject3D( { input, props: p } ) {
    if (!p.currentObject3D) return null;

    /*  prop: 'rotation.x' , returns 0.54 (the value of currentObject3D.rotation.x) */
    function getCurrentValueFromObject3D(prop) {
        if (!p.currentObject3D) return null;
        const props = prop.split('.');
        let val = p.currentObject3D;
        props.forEach( theProp => val = val[theProp] );
        return val;
    }

    /*  WHAT: updates property in Threejs UI. If 'prop' contains a `.` then updates the subproperty 
        prop: `rotation.x` */
    function updatePropObject3D(prop, val) {
        const dataValue = parseInt(val * 100)/100;
        if (!p.currentObject3D) return null;
        const props = prop.split('.');
        const newObject = p.currentObject3D; 
        // shabby way, but it accepts two levels of depth in the props
        if (props.length === 1) 
            newObject[props[0]] = dataValue;
        else 
            newObject[props[0]][props[1]] = dataValue; // updates currentobject3d.rotation.x = dataValue
        // do we need to use setCurrentObject3D? Aparently not.
    }

    /*  helper.          Returns the field value, for the selected hotspot in the pl data options. */
    // TODO: we can use getOptionsByObject3D, which is the same functinoality
    const getObjectData = function(objectName, dataField, defaultVal) {
        const currentWorldOptions = p.getCurrentPanoramaParams();
        let objectHotspotData = currentWorldOptions.hotspots.find( ht => ht.name === objectName );
        if (!objectHotspotData) return;
        let data = objectHotspotData[dataField];
        if (!data) return defaultVal;
        return data ;
    }  

    // preparing placeholders. initial value of the input:
    const currentValue = (p.currentObject3D)? getCurrentValueFromObject3D(input.prop) : null;
    
    return (
        <InputGroup sync-3d={input.field} className={'input-group ' + p.class?? '' } >
            <InputGroup.Prepend> <InputGroup.Text>{input.label}</InputGroup.Text></InputGroup.Prepend>
            <Form.Control type="range" id={input.prop} name={input.prop} className='range-control'
                min={input.min} max={input.max} defaultValue={currentValue} step={input.step}
                onChange={ (e) => {
                    // update the object 3d to see the change
                    updatePropObject3D(input.prop, e.target.value);
                } }
                onMouseUp ={ (e) => {
                    // update the data only when finishing editing
                    SyncObject3d__DataHotspot( { 
                        object3D: window.lastSelectedObj,
                        getOptionsByObject3D: p.getOptionsByObject3D, 
                        setPlOptions: p.setPlOptions,
                        plOptionsReplaceWorldParamsHotspot: p.plOptionsReplaceWorldParamsHotspot} );
                    // updateDataObject(input.prop, e.target.value);
                } }
            /> 
            <InputGroup.Append> <InputGroup.Text>{ getCurrentValueFromObject3D(input.prop) }</InputGroup.Text></InputGroup.Append>
        </InputGroup>
    )
}

export default InputObject3D
