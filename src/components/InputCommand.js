import React, {useState, useEffect} from 'react';


function InputCommand( p ) {

    // p : the props obj. 
    // @p.fields.inputType : type of command: text | range | image | textarea
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

    let inputJSX = null, afterInputJSX = null;
    var InputTag = 'input';
    switch (p.fields.inputType) {
        case "textarea":
            InputTag = 'textarea';
            break;
        case "image": // same as input, later we add the bullet
            break;
        case "text":
            break;
        case "range":
            // get current value from p.currentObjectData for this field.
            let currentVal = null;
            if (p.currentObjectData) {
                currentVal = p.currentObjectData[p.fields.attrName];
                if (p.fields.subattribute) currentVal = currentVal[p.fields.subattribute];
            }
            
            inputJSX = <React.Fragment>
                        <input ref={inputRef} type="range" id={p.fields.attrName} name={p.fields.attrName} min={p.fields.min} max={p.fields.max} defaultValue={currentVal}
                                    onChange={ (e) => { 
                                        // we update the currentData, and it will update also the curent Object 3D state and its position in the viewer
                                        if (p.currentObjectData) {
                                            let dataAndValue = {};
                                            if (typeof p.fields.subattribute !== 'undefined') {
                                                dataAndValue[p.fields.attrName] = p.currentObjectData[p.fields.attrName]; // { pos: [332,23,43] }
                                                dataAndValue[p.fields.attrName][p.fields.subattribute] = inputRef.current.value;
                                            } else dataAndValue[p.fields.attrName] = inputRef.current.value;
                                            p.updateObjectSingleData(p.currentObjectData.name , dataAndValue );  // 'my-object-3d-name', { pos: [133. 23.43 ] }
                                        } 
                                        } } /> 

                                { currentVal?? null }

                        </React.Fragment>
            break;
        case "select":
            InputTag = 'select';
            inputJSX = <select ref={inputRef} onChange={ (e) => {
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
                        </select>
            break;            
        default: // text
            InputTag = 'input';
            break;
    }
    if ( ['text', 'textarea'].includes(p.fields.inputType) )
         inputJSX = <InputTag type="text" defaultValue={ p.currentObjectData? p.currentObjectData[p.fields.attrName] : '' } placeholder={ p.fields.label } 
                                onKeyUp={ p.keyup? p.keyup : (e) => p.currentObjectData? updateWithDelay( p.currentObjectData.name ) : false }
                                onKeyDown={ (e) => stopDelay( p.fields.attrName ) } ref={inputRef} 
                                />

    // bullet to select image after image input
    if (p.fields.inputType === 'image') {
        afterInputJSX =  <i className="fa fa-bullseye" aria-hidden="true" onClick={ (e) => { setPickupImageMode(p.fields.attrName) } }></i>                     
    }
    

  return (
    <label className={ p.fields.dontSync? '' : 'pl-sync-input' + ' form-group' } data-for={ p.fields.attrName } htmlFor={ p.fields.attrName } >
        { p.fields.label } { inputJSX } 
        { afterInputJSX }
        <span className="text-light bg-dark">{ infoAttr }</span>
    </label>
  );
}

export default InputCommand;
