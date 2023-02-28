//Drag & Drop Interfaces
interface Draggable {
    dragStarHandler(event:DragEvent):void,
    dragEndHandler(event:DragEvent) :void,
}

interface DragTarget{
    //Note: Signal the browser that the thing you're dragging something over.
    dragOverHandler(event:DragEvent):void;
    //Note: React to the actual drop that happens.
    dropHandler(event:DragEvent):void,
    //Note: Getting some visual feedback to the user.
    dragLeaveHandler(event:DragEvent):void,
}

//Project type
enum ProjectStatus{Active,Finished}
class Project{
    constructor(public id: string,public title:string,public description:string, public people:number,public status: ProjectStatus){
    }
}

//Project State Management
type Listener<T> = (items:T[]) => void;

//Project State Management

class State<T>{
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn:Listener<T>){
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project>{
    //private listeners: Listener[] = [];
    private projects:Project[] = [];
    private static instance:ProjectState;

    private constructor(){
        super();
    }

    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    // addListener(listenerFn:Listener){
    //     this.listeners.push(listenerFn);
    // }

    addProject(title:string,description:string,numOfPeople:number){ 
        const newProject = new Project( Math.random().toString(),
        title,
        description,
        numOfPeople,ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId:string,newStatus:ProjectStatus){
        const project = this.projects.find( prj => prj.id === projectId);
        if(project && project.status !== newStatus){
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners(){
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

//Validation
interface Validatable{
    value:string | number;
    //The '?' is to set this types to be optional
    required?: boolean;
    minLength?:  number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable){
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

// Autobind decorator.
function Autobind(_:any,_2:string,descriptor:PropertyDescriptor){
    const originalMethod = descriptor.value;
    
    const adjDescriptor: PropertyDescriptor = {
        configurable:true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };

    return adjDescriptor;
}

//Component Base Class
abstract class Component <T extends HTMLElement,U extends HTMLElement> {
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

//ProjectItem Class
class ProjectItem extends Component<HTMLUListElement,HTMLElement> implements Draggable{
    
    private project:Project;

    get persons(){
        if(this.project.people === 1){
            return '1 person';
        }else{
            return `${this.project.people} persons`;
        }
    }
    
    constructor(hostId:string,project:Project){
        super('single-project',hostId,false,project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @Autobind
    //drag
    dragStarHandler(event: DragEvent){
        //Note: This is spacial for dragging events.
        event.dataTransfer!.setData('text/plain',this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent){
        console.log('DragEnd');
    }

    configure(){
        this.element.addEventListener('dragstart',this.dragStarHandler);
        this.element.addEventListener('dragend',this.dragEndHandler);
    }

    renderContent(){
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

//Project Class
class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget{

    // templateElement:HTMLTemplateElement;
    // hostElement: HTMLDivElement;
    // element: HTMLElement;

    assignedProjects:Project[];

    constructor(private type: 'active' | 'finished'){
        super('project-list','app',false,`${type}-projects`);
        // this.templateElement = document.getElementById('project-list') as HTMLTemplateElement;

        // this.hostElement = document.getElementById('app') as HTMLDivElement;

        this.assignedProjects = [];
        
        // const importedNote = document.importNode(this.templateElement.content,true);

        // this.element = importedNote.firstElementChild as HTMLElement;

        // this.element.id = `${this.type}-projects`;

        // projectState.addListener((projects:Project[])=>{
        //     const relevantProjects = projects.filter(prj => {
        //         if(this.type === 'active'){
        //             return prj.status === ProjectStatus.Active
        //         }
        //         return prj.status === ProjectStatus.Finished
        //     })
        //     this.assignedProjects = relevantProjects;
        //     this.renderProjects();
        // });
        this.configure();
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }
    @Autobind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(
            prjId,
            this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
        )
    }
    @Autobind
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }
    
    configure(){

        this.element.addEventListener('dragover',this.dragOverHandler);
        this.element.addEventListener('dragleave',this.dragLeaveHandler);
        this.element.addEventListener('drop',this.dropHandler);

        projectState.addListener((projects:Project[])=>{
            const relevantProjects = projects.filter(prj => {
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    
    renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS';
    }
    
    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for(const prjItem of  this.assignedProjects){
            // const listItem = document.createElement('li');
            // listItem.textContent = prjItem.title;
            // listEl.appendChild(listItem);
            new ProjectItem(this.element.querySelector('ul')!.id,prjItem);
        }
    }

    // private attach(){
    //     this.hostElement.insertAdjacentElement('beforeend',this.element);
    // }
}

//Project Input Class
class ProjectInput extends Component <HTMLDivElement, HTMLFormElement>{
    
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

const prjInput = new ProjectInput();
const activeProject = new ProjectList('active');
const finishedProject = new ProjectList('finished');