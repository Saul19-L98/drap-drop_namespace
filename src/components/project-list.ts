/// <reference path="base-component.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../state/project-state.ts"/>
/// <reference path="../models/project-model.ts"/>
/// <reference path="../models/drag-drop.ts"/>

namespace App{
    //Project Class
    export class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget{

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
}