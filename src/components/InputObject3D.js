import React, { useState, useEffect, useRef } from 'react'

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import {round2} from '../helpers'

/**
 * Inputs in sync with props of the current3DObject inside the Canvas.
 * The difference with InputData is that InputData is in sync with the datamodel (the options) of the current selected object.
 */
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

    /*  WHAT : updates the pl options data of the hotspot related to the current selected 3Dobject in UI
        props: 'rotation.x', val : 0.55 . */
    function updateDataObject(props, val) {
        const dataValue = parseInt(val * 100)/100;
        if (props.includes('rotation')) {
            const rotData = getObjectData(p.currentObject3D.name, 'rot', input.default); // [1, 0.2, 0 ]
            if (props.includes('.x')) rotData[0] = dataValue;
            if (props.includes('.y')) rotData[1] = dataValue;
            if (props.includes('.z')) rotData[2] = dataValue;
            p.updateObjectSingleData( p.currentObject3D.name, { 'rot' : rotData }, false);
        }
        if (props.includes('scale')) {
            const scale = getObjectData(p.currentObject3D.name, 'scale', input.default);
            p.updateObjectSingleData( p.currentObject3D.name, { 'scale' : dataValue }, false);
        }
    }

    /*  helper.          Returns the field value, for the selected hotspot in the pl data options. */
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
                    updateDataObject(input.prop, e.target.value);
                } }
            /> 
            <InputGroup.Append> <InputGroup.Text>{ getCurrentValueFromObject3D(input.prop) }</InputGroup.Text></InputGroup.Append>
        </InputGroup>
    )
}

export default InputObject3D
