import React, {useState, useEffect} from 'react';

import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import _ from "lodash";

function InputCommand( p ) {

    // p : the props obj. 
    // @p.fields.inputType : type of command: text | range | image | textarea | select
    // @p.fields.attrName : id of attr in Object Data Params. ie "name"
    // @p.fields.label : name to show in screen. ie "Poster Name"

    // Local State
    const [infoAttr, setInfoAttr] = useState(''); // a little message saying "updating", "saved" to the user
    var inputRef = React.createRef(); // we need to access to the value of the input when it changes

    // tool to fillup an image input by selecting an image in the screen.
    const [pickupImageMode, setPickupImageMode] = useState(false);
    useEffect(() => {
        if (! pickupImageMode) return;
        setInfoAttr('Pick up an image in the screen');
        const handlePickupImg = (e) => {
            if (e.target?.src) {
                document.querySelector("[data-for='"+pickupImageMode+"'] input").value = e.target.src; // I tried using refs but here it doesnt read them
                const values = {};
                values[p.fields.attrName] = e.target.src;
                updateDataAndObjectFromData( values );
                setPickupImageMode(false);
                document.removeEventListener('click', handlePickupImg, 'pickupImg' );
                document.removeEventListener("keydown", handleCancelPickupImage, 'cancelPickup' );        
                setInfoAttr("Image selected"); setTimeout( () => setInfoAttr(''), 3000 );
            }
        };
        const handleCancelPickupImage = function(event) {
            if(event.keyCode === 27){ // clicking ESC
                setPickupImageMode(false);
                setInfoAttr("Cancelled"); setTimeout( () => setInfoAttr(''), 3000 );
                document.removeEventListener('click', handlePickupImg, 'pickupImg' );
                document.removeEventListener("keydown", handleCancelPickupImage, 'cancelPickup' );        
           }
        };
        document.addEventListener('click', handlePickupImg, 'pickupImg' );
        document.addEventListener("keydown", handleCancelPickupImage, 'cancelPickup' );
    }, [pickupImageMode]);

    // updates p.currentObjectData
    const updateDataAndObjectFromData = function(updatedFields) {
        p.updateObjectSingleData(p.currentObjectData.name, updatedFields); // updatedFields is object, ie: { hoverText: "The text edited in textarea"}
        setInfoAttr('saved'); setTimeout(()=>setInfoAttr(''), 1000);
        setDelaysOnKeyUp(null);            
        if (p.fields.regenerateObject) {
            p.removeObject(p.currentObject3D);
            p.pl.createNewObjectFromParams(p.pl.viewer.panorama, p.currentObjectData); // recreate the 3d in the viewer
        }
        if (p.fields.callbackUpdate) {
            p.fields.callbackUpdate(updatedFields);
        }
    }

    const [delaysOnKeyUp, setDelaysOnKeyUp] = useState(null); // flag with the last id of the timeout of 1sec.
    /**
     * helpers to avoid that the fn executes on every keyup. It waits until the user stop typing for some secs.
     * @param {string} id : id of the delay. ie "name"
     * @param {function} fn : the function to trigger
     * @param {array} args : the args of the function inside an array.
     */
    const updateWithDelay = function( ) { // reset the timeout clearing the previous
        if (p.currentObjectData[p.fields.attrName] === inputRef.current.value) { // in case the key pressed is not typing anything (ie arrow left)
            setInfoAttr('');
            setDelaysOnKeyUp(null);
            return;    
        }
        clearTimeout(delaysOnKeyUp);
        setInfoAttr('updating');
        const updatedFields = {};
        updatedFields[p.fields.attrName] = inputRef.current.value;
        const toId = setTimeout( () => {
            updateDataAndObjectFromData(updatedFields);
        }, 1000 );
        setDelaysOnKeyUp(toId);
    }
    const stopDelay = function( id ) { // stop any programmed action
        clearTimeout(delaysOnKeyUp);
    }

    // helper
    function newJSObject( attr, value ) {
        const js_object = {}
        js_object[attr] = value;
        return js_object;
    }

    // if select, options must be an object
    if (Array.isArray(p.fields.options)) { // convert array to object.         
        p.fields.options = p.fields.options.reduce( (obj, currVal) => { obj[currVal] = currVal; return obj }, { 'no link' : '' } );
    }

    let inputJSX = null, afterInputJSX = null, prepend = true, append = null;
    var as = 'input';
    const hasSubAtrr = typeof p.fields.subattribute !== 'undefined';
    const name = p.fields.attrName + (hasSubAtrr? p.fields.subattribute : '') ;
    switch (p.fields.inputType) {
        case "textarea":
            as = 'textarea';
            break;
        case "image": // same as input, later we add the bullet
            break;
        case "text":
            break;    
        case "number":
            inputJSX = <Form.Group controlId={name}>
                <Form.Check type={p.fields.inputType} label={p.fields.label}
                            ref={inputRef} defaultValue={p.currentObjectData[p.fields.attrName]} 
                                onChange={ (e) => { 
                                    const newValues = {};
                                    newValues[p.fields.attrName] = inputRef.current.value;
                                    updateDataAndObjectFromData( newValues );  // 'my-object-3d-name', { pos: [133. 23.43 ] }
                                } } />
            </Form.Group>
            break;

        case "checkbox":
            inputJSX = <Form.Group controlId={name}>
                <Form.Check type={p.fields.inputType} label={p.fields.label}
                            ref={inputRef} defaultChecked={p.currentObjectData[p.fields.attrName]} 
                                onChange={ (e) => { 
                                    const newValues = {};
                                    newValues[p.fields.attrName] = inputRef.current.checked;
                                    updateDataAndObjectFromData( newValues );  // 
                                } } />
            </Form.Group>
            prepend = false; // so we dont show the prepend
            break;
        case "range":
            as = 'range';
            // get current value from p.currentObjectData for this field.
            let currentVal = null;
            if (p.currentObjectData) { 
                currentVal = p.currentObjectData[p.fields.attrName];
                if (hasSubAtrr && currentVal) currentVal = currentVal[p.fields.subattribute];
            }
            
            inputJSX = 
                        <Form.Control type="range" ref={inputRef} id={name} name={name} className='w-50'
                                        min={p.fields.min} max={p.fields.max} defaultValue={currentVal} { ...(p.fields.step? { step: p.fields.step } : null) }
                                    onChange={ _.debounce( (e) => { 
                                        // we update the currentData, and it will update also the curent Object 3D state and its position in the viewer
                                        if (!inputRef.current) {
                                            console.error('input Ref is not defined!');
                                            return;
                                        }
                                        const inputValue = parseInt(inputRef.current.value * 100)/100;
                                        if (p.currentObjectData) {
                                            let dataAndValue = {};
                                            if (hasSubAtrr) {
                                                dataAndValue[p.fields.attrName] = p.currentObjectData[p.fields.attrName]; // { pos: [332,23,43] }
                                                dataAndValue[p.fields.attrName][p.fields.subattribute] = inputValue;
                                            } else dataAndValue[p.fields.attrName] = inputValue;
                                            updateDataAndObjectFromData( dataAndValue );  // 'my-object-3d-name', { pos: [133. 23.43 ] }
                                        } 
                                    }, 250 ) }  /> 

            append =  <span className="current-val"> { typeof currentVal !== 'undefined'? Math.round(currentVal * 100) / 100 : null } </span>;
                               

                        
            break;
        case "select":
            as = 'select';
            inputJSX = <FormControl as={as} ref={inputRef} onChange={ (e) => {
                                                            if (p.currentObjectData) {
                                                                const updateFields = {};
                                                                updateFields[p.fields.attrName] = inputRef.current.value; // assign the value of the input select
                                                                updateDataAndObjectFromData(updateFields);
                                                            } 
                                                            } }>
                            {   
                                (typeof p.fields.options === 'object') ? Object.keys(p.fields.options)?.map( option => { 
                                    return <option key={option} value={ p.fields.options[option] } >{ option }</option>
                                }) : null
                            }
                        </FormControl>
            break;            
        default: // text
            as = 'input';
            break;
    }
    if ( ['text', 'textarea', 'image'].includes(p.fields.inputType) )
         inputJSX = <FormControl as={as} defaultValue={ p.currentObjectData? p.currentObjectData[p.fields.attrName] : '' } placeholder={ p.fields.label } 
                                onKeyUp={ p.keyup? p.keyup : (e) => p.currentObjectData? updateWithDelay( p.currentObjectData.name ) : false }
                                onKeyDown={ (e) => stopDelay( p.fields.attrName ) } ref={inputRef} 
                                />

    // bullet to select image after image input
    if (p.fields.inputType === 'image') {
        afterInputJSX =  <InputGroup.Append onClick={ (e) => { setPickupImageMode(p.fields.attrName) } }>
                            <InputGroup.Text>
                                <i className="fa fa-bullseye" aria-hidden="true"></i>
                            </InputGroup.Text>
                        </InputGroup.Append>
    }
    

  return (
    <label className={ p.fields.dontSync? '' : 'pl-sync-input' + ' form-group' } data-for={ p.fields.attrName } { ...( p.fields.subattribute? { 'data-for-subfield' : p.fields.subattribute } : null ) } 
            htmlFor={ p.fields.attrName } >
        <InputGroup>
            {prepend ? <InputGroup.Prepend> <InputGroup.Text>{ p.fields.label }</InputGroup.Text></InputGroup.Prepend> : null } 
            { inputJSX } 
            { afterInputJSX }
            { append? 
                <InputGroup.Append>
                    <InputGroup.Text>
                        {append}
                    </InputGroup.Text>
                </InputGroup.Append> : null }
        </InputGroup>
        <span className="text-light bg-dark">{ infoAttr }</span>
    </label>
  );
}

export default InputCommand;
