namespace App {
    //Drag & Drop Interfaces
    export interface Draggable {
        dragStarHandler(event:DragEvent):void,
        dragEndHandler(event:DragEvent) :void,
    }

    export interface DragTarget{
        //Note: Signal the browser that the thing you're dragging something over.
        dragOverHandler(event:DragEvent):void;
        //Note: React to the actual drop that happens.
        dropHandler(event:DragEvent):void,
        //Note: Getting some visual feedback to the user.
        dragLeaveHandler(event:DragEvent):void,
    }
}