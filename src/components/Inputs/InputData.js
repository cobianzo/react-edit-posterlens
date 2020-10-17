import React, { useState } from 'react'

import Button from 'react-bootstrap/Button';

import InputImage from './InputImage';
import { SyncInputFieldset__DataHotspot } from '../SyncDataAlongApp' // sync input changes into plOptions
import { FilePicker } from 'react-file-picker'
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

export default function InputData(p) {

    const [infoMsg, setInfoMsg] = useState('');

    const syncParams = {  getCurrentPanoramaParams: p.getCurrentPanoramaParams,
                    plOptionsReplaceWorldParamsHotspot: p.plOptionsReplaceWorldParamsHotspot,
                    setPlOptions: p.setPlOptions,
                    selectObject: p.selectObject,
                    setCurrentObject3D: p.setCurrentObject3D }
 
    // udpated fied p.input.option with the value. Some fields have special treatment
    const wrapperUpdateObjectSingleData = function (value) {
        let theValue = value === p.input.deleteIfValue ? null : value; // with this we will remove the option from the params.
        const fieldPair = { [p.input.option] : theValue };
        // special fields that need special treatment
        if ( p.input.option === 'background' && theValue === '' ) fieldPair[p.input.option] = 'transparent'; // no bg color => background: 'transparent'
        if ( p.input.option === 'sprite' && theValue === true ) fieldPair.scale = p.currentObject3D.scale.x * 10; // if we convert into sprite we better scale or it will look tiny
        if ( p.input.option === 'sprite' && !theValue ) fieldPair.scale = p.currentObject3D.scale.x / 10; // the other way as well.
        let regenerate = ['name'].includes(p.input.option)? false : true; // regenerate bu default , except in some, like 'name'
        SyncInputFieldset__DataHotspot( p.currentObject3D.name, fieldPair, regenerate, syncParams);
        setInfoMsg('Applied!');  setTimeout(()=>setInfoMsg(''), 1000);
        p.selectObject(window.lastSelectedObj);
    }

    const viewInput = function() {
        
        const currentValue = p.getOptionsByObject3D(p.currentObject3D, p.input.option);
        // if (p.input.option === 'emissive') debugger
        switch (p.input.type) {
            case "image-pick":
                return <InputImage input={p.input} currentObject3D={p.currentObject3D} getOptionsByObject3D={p.getOptionsByObject3D}
                                    wrapperUpdateObjectSingleData={wrapperUpdateObjectSingleData} />
            case "image": // not in use I think
                return <InputGroup >
                    <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend>
                    <FilePicker 
                extensions={['jpg', 'jpeg', 'png', 'gif', 'svg']}
                dims={{minWidth: 100, maxWidth: 2500, minHeight: 100, maxHeight: 2500}}
                onChange={base64 => SyncInputFieldset__DataHotspot( p.currentObject3D.name, { [p.input.option]: p.imgPath+base64.name}, true, syncParams ) }
                onError={ errMsg => alert(errMsg) }
            >
                <Button variant='primary'>
                Select image
                </Button >
                </FilePicker>
                <Button variant='danger' onClick={ (e) => { wrapperUpdateObjectSingleData(null) } }>
                    Clear
                </Button >
                <InputGroup.Append> <InputGroup.Text>{currentValue}</InputGroup.Text></InputGroup.Append>
                </InputGroup>
            case "input":
            case "textarea":
                return <form 
                            onSubmit={ (e) => { e.preventDefault(); 
                                    wrapperUpdateObjectSingleData(e.currentTarget.querySelector('input').value) } }
                        >
                    <InputGroup>
                    {p.input.label ? <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend> : null }
                        <FormControl as={p.input.type} defaultValue={currentValue} onChange={ e => setInfoMsg('Enter to save') }  placeholder={ p.input.placeholder?? ' '} />
                        <InputGroup.Append onClick={ (e) => infoMsg ? wrapperUpdateObjectSingleData(e.currentTarget.closest('form').querySelector(p.input.type).value) : false } >
                            <InputGroup.Text> { infoMsg || currentValue  } </InputGroup.Text>
                        </InputGroup.Append>
                    </InputGroup>
                </form>             
            case "number":
                return  <form onSubmit={ (e) => { e.preventDefault(); wrapperUpdateObjectSingleData(e.currentTarget.querySelector('input').value) } }
                             >
                            <InputGroup>
                                {p.input.label ? <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend> : null }
                                <Form.Check type="number" step={ p.input.step?? 1 } placeholder={ p.input.placeholder?? ' '}
                                    defaultValue={currentValue} min={p.input.min?? 0 } max={p.input.max?? null } 
                                    onChange={ e => setInfoMsg('Enter to save') } />
                                <InputGroup.Append onClick={ (e) => infoMsg ? wrapperUpdateObjectSingleData(e.currentTarget.closest('form').querySelector('input').value) : false } >
                                    <InputGroup.Text> { infoMsg || currentValue  } </InputGroup.Text> 
                                </InputGroup.Append>
                            </InputGroup>
                        </form>
            case "checkbox":
                return <Form.Group>
                <Form.Check type="checkbox" label={p.input.label + `(${currentValue})`}
                            defaultChecked={currentValue === p.input.checkedValue() || p.input.deleteIfValue === p.input.checkedValue() }
                                onChange={ (e) => {
                                    const value = e.currentTarget.checked? p.input.checkedValue(p.currentObject3D) : p.input.uncheckedValue(p.currentObject3D) ;
                                    wrapperUpdateObjectSingleData(value);                                            
                                } } />
                </Form.Group>
            case "select":
                return <InputGroup>
                     <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend>
                    <FormControl as='select' defaultValue={currentValue}
                                        onChange={ (e) => wrapperUpdateObjectSingleData(e.target.value) } >
                                <option key='nothing' value='' >---</option>
                                {   
                                    (typeof p.input.options === 'object') ? Object.keys(p.input.options)?.map( option => { 
                                        return <option key={option} value={ p.input.options[option] } >{ option }</option>
                                    }) : null
                                }
                    </FormControl>
                    <InputGroup.Append><InputGroup.Text> { currentValue } </InputGroup.Text> </InputGroup.Append>
                </InputGroup>
                break;
            case "color":
                return <InputGroup sync-3d={p.input.option}>
                        <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend>
                        <input type="color" defaultValue={ currentValue || p.input.deleteIfValue }
                                onChange={ (e) => wrapperUpdateObjectSingleData(e.target.value) }></input>
                        <InputGroup.Append><InputGroup.Text> {currentValue} </InputGroup.Text> </InputGroup.Append>
                </InputGroup>
            default:
            break;
        }
    }

    return <div className={ p.input.type + '-type ' + (infoMsg? 'editing ' : 'no-editing ') + (p.class?? '') }
                id={ 'input-' + p.input.option} 
                sync-3d={ ['image'].includes(p.input.type)? '' : p.input.option} sync-default={p.input.deleteIfValue? "true" : "false"}> { 
                viewInput()
            }</div>
}
