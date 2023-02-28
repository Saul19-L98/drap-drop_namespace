namespace App{
    //Validation
    export interface Validatable{
        value:string | number;
        //The '?' is to set this types to be optional
        required?: boolean;
        minLength?:  number;
        maxLength?: number;
        min?: number;
        max?: number;
    }
    export function validate(validatableInput: Validatable){
        let isValid = true;
        if(validatableInput.required){   
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        // One equal sign includes null and undefined
        if(validatableInput.minLength != null && typeof validatableInput.value === 'string'){
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if(validatableInput.maxLength != null && typeof validatableInput.value === 'string'){
            isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
        }
        if(validatableInput.min != null && validatableInput.value === 'number'){
            isValid = isValid && +validatableInput.value >= validatableInput.min;
        }
        if(validatableInput.max != null && validatableInput.value === 'number'){
            isValid = isValid && +validatableInput.value < validatableInput.max;
        }  
        return isValid;
    }
}