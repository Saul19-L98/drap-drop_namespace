/// <reference path="base-component.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../utils/validation.ts"/>
/// <reference path="../state/project-state.ts"/>

namespace App{
    //Project Input Class
    export class ProjectInput extends Component <HTMLDivElement, HTMLFormElement>{
        
        //Fields

        // templateElement:HTMLTemplateElement;
        // hostElement: HTMLDivElement;
        // element: HTMLFormElement;

        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;
        
        constructor(){
            super('project-input','app',true,'user-input');
            // this.templateElement = document.getElementById('project-input') as HTMLTemplateElement;

            // this.hostElement = document.getElementById('app') as HTMLDivElement;
            
            // const importedNote = document.importNode(this.templateElement.content,true);

            // this.element = importedNote.firstElementChild as HTMLFormElement;

            // this.element.id = 'user-input';

            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;

            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;

            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

            this.configure();
            // this.attach();
        }

        configure(){
            this.element.addEventListener('submit',this.submitHandler);
        }

        renderContent(){}
        
        private clearInputs(){
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = '';
        }

        //Return tuple or nothing
        private gatherUserInput():[string,string,number] | void{
            const enteredTitle =  this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;

            //Validated Object
            const titleValidatable:Validatable = {
                value: enteredTitle,
                required: true,
            }
            const descriptionValidatable:Validatable = {
                value: enteredDescription,
                required: true,
                minLength: 5,
            }
            const peopleValidatable:Validatable = {
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 5,
            }

            if(
                !validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)
            ){
                alert('Invalid input,please try again!');
                return;
            }else{
                return [enteredTitle,enteredDescription,+enteredPeople];
            }
        }

        @Autobind
        private submitHandler(event:Event){
            event.preventDefault();
            //console.log(this.titleInputElement.bind(value))
            //console.log(this.titleInputElement.value)
            
            const userInput = this.gatherUserInput();

            //Validate if a tuple is an array
            if(Array.isArray(userInput)){
                const [title,desc,people] = userInput;
                projectState.addProject(title,desc,people);
                this.clearInputs();
                // console.log(title,desc,people);
            }
        }


        // private attach(){
        //     this.hostElement.insertAdjacentElement('afterbegin',this.element);
        // }
    }        
}