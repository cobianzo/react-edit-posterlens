import React, {useState, useEffect} from 'react'
import { Button } from 'react-bootstrap';

function SelectFile() {

    const [fileSelector, setFileSelector ] = useState(null);
    
    useEffect(() => {
        setFileSelector(buildFileSelector());
    }, [])
    
    function buildFileSelector(){
        const fileSel = document.createElement('input');
        fileSel.setAttribute('type', 'file');
        //fileSel.setAttribute('multiple', 'multiple');
        return fileSel;
    }
    
    const handleFileSelect = (e) => {
        e.preventDefault();
        this.fileSelector.click();
    }
    
    return (<div>
                <Button onClick={handleFileSelect}>Save posterlens params</Button>
                {fileSelector}
           </div>)
    
}

export default SelectFile
