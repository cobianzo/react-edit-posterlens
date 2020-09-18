import React from 'react'

import Button from 'react-bootstrap/Button';

import { FilePicker } from 'react-file-picker'
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

export default function Input(p) {

    const wrapperUpdateObjectSingleData = function (value) {
        let theValue = value === p.input.deleteIfValue ? null : value; // with this we will remove the option from the params.
        const fieldPair = { [p.input.option] : theValue };
        // special fields that need special treatment
        if ( p.input.option === 'background' && theValue === '' ) fieldPair[p.input.option] = 'transparent'; // no bg color => background: 'transparent'
        if ( p.input.option === 'sprite' && theValue === true ) fieldPair.scale = p.currentObject3D.scale.x * 100; // if we convert into sprite we better scale or it will look tiny
        if ( p.input.option === 'sprite' && !theValue ) fieldPair.scale = p.currentObject3D.scale.x / 100; // the other way as well.
        p.updateObjectSingleData( p.currentObject3D.name, fieldPair);
    }

    const viewInput = function() {
        switch (p.input.type) {
            case "image":
                return <InputGroup >
                    <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend>
                    <FilePicker 
                extensions={['jpg', 'jpeg', 'png', 'gif', 'svg']}
                dims={{minWidth: 100, maxWidth: 2500, minHeight: 100, maxHeight: 2500}}
                onChange={base64 => p.updateObjectSingleData( p.currentObject3D.name, { [p.input.option]: p.imgPath+base64.name}) }
                onError={ errMsg => alert(errMsg) }
            >
                <Button variant='primary'>
                Select image
                </Button >
                </FilePicker>
                <Button variant='danger' onClick={ (e) => { wrapperUpdateObjectSingleData(null) } }>
                    Clear
                </Button >
                <InputGroup.Append> <InputGroup.Text>{p.getOptionsByObject3D(p.currentObject3D, p.input.option)}</InputGroup.Text></InputGroup.Append>
                </InputGroup>
            case "input":
                return <form onSubmit={ (e) => { e.preventDefault(); wrapperUpdateObjectSingleData(e.currentTarget.querySelector('input').value) } }
>
                    <InputGroup>
                        <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend>
                        <FormControl as='input' defaultValue={p.getOptionsByObject3D(p.currentObject3D, p.input.option)}  />
                        <InputGroup.Append><InputGroup.Text> {p.getOptionsByObject3D(p.currentObject3D, p.input.option)} </InputGroup.Text> </InputGroup.Append>
                    </InputGroup>
                </form>
            case "number":
                return  <form onSubmit={ (e) => { e.preventDefault(); wrapperUpdateObjectSingleData(e.currentTarget.querySelector('input').value) } }
                                >
                            <InputGroup>
                                <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend>
                                <Form.Check type="number" step={ p.input.step?? 1 }
                                    defaultValue={p.getOptionsByObject3D(p.currentObject3D, p.input.option)} />
                                <InputGroup.Append><InputGroup.Text> {p.getOptionsByObject3D(p.currentObject3D, p.input.option)} </InputGroup.Text> </InputGroup.Append>
                            </InputGroup>
                        </form>
            case "checkbox":
                return <Form.Group >
                <Form.Check type="checkbox" label={p.input.label}
                            defaultChecked={p.getOptionsByObject3D(p.currentObject3D, p.input.option) === p.input.checkedValue()}
                                onChange={ (e) => {
                                    const value = e.currentTarget.checked? p.input.checkedValue(p.currentObject3D) : p.input.uncheckedValue(p.currentObject3D) ;
                                    wrapperUpdateObjectSingleData(value);                                            
                                } } />
                </Form.Group>
            case "select":
                return <InputGroup>
                     <InputGroup.Prepend> <InputGroup.Text>{p.input.label}</InputGroup.Text></InputGroup.Prepend>
                    <FormControl as='select' defaultValue={p.getOptionsByObject3D(p.currentObject3D, p.input.option)}
                                        onChange={ (e) => wrapperUpdateObjectSingleData(e.target.value) }>
                                <option key='nothing' value='' >---</option>
                                {   
                                    (typeof p.input.options === 'object') ? Object.keys(p.input.options)?.map( option => { 
                                        return <option key={option} value={ p.input.options[option] } >{ option }</option>
                                    }) : null
                                }
                    </FormControl>
                    <InputGroup.Append><InputGroup.Text> {p.getOptionsByObject3D(p.currentObject3D, p.input.option)} </InputGroup.Text> </InputGroup.Append>
                </InputGroup>
            default:
            break;
        }
    }

    return viewInput();
}