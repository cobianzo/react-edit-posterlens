import React, {useState, useEffect} from 'react';

import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

/**
 * Input "Select image" that sets the option p.input.option to that image.
 * Allows 
 * */
function InputImage( p ) {

    // p : the props obj. 
    // @p.input (option, label)

    // Local State
    const [infoAttr, setInfoAttr] = useState(''); // a little message saying "updating", "saved" to the user
    
    // tool to fillup an image input by selecting an image in the screen.
    const [pickupImageMode, setPickupImageMode] = useState(false);

    // watch the activation of the mode "pickup image in screen"
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
    

    function handlePickImage(event) {
        // optionally we can interact from outside react with tthe selection. If we have set an element with class 'pl_selected_image', we'll grab that img.
        if (document.querySelector('.pl_selected_image')) {
            const selected_img = document.querySelector('.pl_selected_image');
            if (selected_img.tagName === 'IMG') 
                p.wrapperUpdateObjectSingleData( selected_img.getAttribute('src') );
            else if ( selected_img.getAttribute('data-url') ) // we accept that the element with pl_sel.. class has an attribute with the url.
                p.wrapperUpdateObjectSingleData( selected_img.getAttribute('data-url') );
            
            return;
        }
        // or standard behaviour. Any img in the window can be clicked and we use its src field as value.
        setPickupImageMode(p.input.option) 
    }

  return (
    
        <InputGroup className={ 'input-group-' + p.input.option }>

            <InputGroup.Prepend>
                <InputGroup.Text>
                    { p.input.label }
                </InputGroup.Text>
            </InputGroup.Prepend>
            <InputGroup.Append onClick={ handlePickImage  }>
                <InputGroup.Text>
                    { pickupImageMode? 'select an image' : <Button variant="primary">Pick image</Button> }
                </InputGroup.Text>
            </InputGroup.Append>

                <InputGroup.Append>
                    <InputGroup.Text>
                        {p.getOptionsByObject3D(p.currentObject3D, p.input.option)}
                    </InputGroup.Text>
                </InputGroup.Append>
                <span className="text-light bg-dark">{ infoAttr }</span>
        </InputGroup>

  );
}

export default InputImage;
