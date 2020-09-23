import React, {useState, useEffect} from 'react';

import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import _ from "lodash";

function InputImage( p ) {

    // p : the props obj. 
    // @p.input : 
    // p

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
                const value = e.target.src; // I tried using refs but here it doesnt read them
                p.wrapperUpdateObjectSingleData(value);

                // remove events to normal
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

   

    const [delaysOnKeyUp, setDelaysOnKeyUp] = useState(null); // flag with the last id of the timeout of 1sec.
 

    let afterInputJSX = null, append = null;
   

    
    

    

  return (
    <label className=' form-group'>
        <InputGroup>

            <InputGroup.Prepend>
                <InputGroup.Text>
                    { p.input.label }
                </InputGroup.Text>
            </InputGroup.Prepend>
            <InputGroup.Append onClick={ (e) => { setPickupImageMode(p.input.option) } }>
                <InputGroup.Text>
                    { pickupImageMode? 'select an image' : <Button variant="primary">Pick image</Button> }
                </InputGroup.Text>
            </InputGroup.Append>

                <InputGroup.Append>
                    <InputGroup.Text>
                        {p.getOptionsByObject3D(p.currentObject3D, p.input.option)}
                    </InputGroup.Text>
                </InputGroup.Append>
        </InputGroup>
        <span className="text-light bg-dark">{ infoAttr }</span>
    </label>
  );
}

export default InputImage;
