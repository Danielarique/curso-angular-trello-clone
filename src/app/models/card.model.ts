import { List } from "./list.model";

export interface Card{
    id:string;
    title:string;
    position:string;
    description?: string;
    list: List;
}


export interface CreateCardDto extends Omit<Card, 'id' | 'list'>{
    listId: string;
    boardId?:string;
}

export interface UpdateCardDto{
    title?: string;
    description?: string;
    position?: number;
    listId?:string;
    boardId?: string;
}