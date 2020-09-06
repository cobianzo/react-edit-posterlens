import React, {useState, useEffect} from 'react';


function InputCommand( p ) {

    // p : the props obj. 
    // @p.inputType : type of command: text | range | image | textarea
    // @p.attrName : id of attr in Object Data Params. ie "name"
    // @p.label : name to show in screen. ie "Poster Name"

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
                values[p.attrName] = e.target.src;
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


    const updateDataAndObjectFromData = function(updatedFields) {
        p.updateObjectSingleData(p.currentObjectData.name, updatedFields); // updatedFields is object, ie: { hoverText: "The text edited in textarea"}
        setInfoAttr('saved'); setTimeout(()=>setInfoAttr(''), 1000);
        setDelaysOnKeyUp(null);            
        if (p.regenerateObject) {
            p.removeObject(p.currentObject3D);
            p.pl.createNewObjectFromParams(p.pl.viewer.panorama, p.currentObjectData);
        }
        if (p.callbackUpdate) {
            p.callbackUpdate(updatedFields);
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
        if (p.currentObjectData[p.attrName] === inputRef.current.value) { // in case the key pressed is not typing anything (ie arrow left)
            setInfoAttr('');
            setDelaysOnKeyUp(null);
            return;    
        }
        clearTimeout(delaysOnKeyUp);
        setInfoAttr('updating');
        const updatedFields = {};
        updatedFields[p.attrName] = inputRef.current.value;
        const toId = setTimeout( () => {
            updateDataAndObjectFromData(updatedFields);
        }, 1000 );
        setDelaysOnKeyUp(toId);
    }
    const stopDelay = function( id ) { // stop any programmed action
        clearTimeout(delaysOnKeyUp);
    }

    let inputJSX = null, afterInputJSX = null;
    var InputTag = 'input';
    switch (p.inputType) {
        case "range":
            break;
        case "textarea":
            InputTag = 'textarea';
        case "image": // same as input, later we add the bullet
            InputTag = 'input';
        case "text": // same as input, later we add the bullet
            InputTag = 'input';
        default: // text
            inputJSX = <InputTag type="text" defaultValue={ p.currentObjectData? p.currentObjectData[p.attrName] : '' } placeholder={ p.label } 
                                onKeyUp={ p.keyup? p.keyup : (e) => p.currentObjectData? updateWithDelay( p.currentObjectData.name ) : false }
                                onKeyDown={ (e) => stopDelay( p.attrName ) } ref={inputRef} 
                                />
            break;
    }

    // bullet to select image after image input
    if (p.inputType === 'image') {
        afterInputJSX =  <i className="fa fa-bullseye" aria-hidden="true" onClick={ (e) => { setPickupImageMode(p.attrName) } }></i>                     
    }

  return (
    <label className="pl-sync-input form-group" data-for={ p.attrName } htmlFor={ p.attrName } >
        { p.label } { inputJSX } 
        { afterInputJSX }
        <span className="text-light bg-dark">{ infoAttr }</span>
    </label>
  );
}

export default InputCommand;
