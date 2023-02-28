namespace App{
    //Component Base Class
    export abstract class Component <T extends HTMLElement,U extends HTMLElement> {
        templateElement:HTMLTemplateElement;
        hostElement: T;
        element: U;
        
        constructor(templateId: string, hostElementId:string,insertAtStart:boolean,newElmentId?:string){
            this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;

            this.hostElement = document.getElementById(hostElementId) as T;

            const importedNote = document.importNode(this.templateElement.content,true);

            this.element = importedNote.firstElementChild as U;

            if(newElmentId){
                this.element.id = newElmentId;
            }

            this.attach(insertAtStart);
        }

        private attach(insertAtBiginning:boolean){
            this.hostElement.insertAdjacentElement( insertAtBiginning ? 'afterbegin' : 'beforeend',this.element);
        }

        abstract configure(): void;
        abstract renderContent(): void;
    }
}