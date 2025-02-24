import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { TodoDialogComponent } from '@boards/components/todo-dialog/todo-dialog.component';

import { ToDo, Column } from '@models/todo.model';
import { ActivatedRoute } from '@angular/router';
import { Board } from '../../../../models/boards.model';
import { BoardsService } from '../../../../services/boards.service';
import { Card } from '../../../../models/card.model';
import { CardsService } from '../../../../services/cards.service';
import { List } from '../../../../models/list.model';
import { FormControl, Validators } from '@angular/forms';
import { ListsService } from '../../../../services/lists.service';
import { BACKGROUNDS } from '../../../../models/colors.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drag-animating {
        transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board | null = null;
  showListForm = false;
  inputCard = new FormControl<string>('',{
    nonNullable: true,
    validators: [Validators.required]
  });
  inputList = new FormControl<string>('',{
    nonNullable: true,
    validators: [Validators.required]
  });

  colorBackgrounds = BACKGROUNDS;
  constructor(private dialog: Dialog, 
    private activatedRoute: ActivatedRoute,
    private boardsService: BoardsService,
    private cardsService: CardsService,
    private listsService: ListsService) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      if(id){
        this.getBoard(id);
      }
    });
  }


  ngOnDestroy(): void {
      this.boardsService.setBackgroundColor('sky');
  }
  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    const position = this.boardsService.getPosition( event.container.data,event.currentIndex);
    const card = event.container.data[event.currentIndex];
    const listId = event.container.id;

    this.updateCard(card, Number(position), listId);
    console.log(listId)
  }

   addColumn() {
 /*    this.columns.push({
      title: 'New Column',
      todos: [],
    }); */
  } 

  openDialog(card: Card) {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      minWidth: '300px',
      maxWidth: '50%',
      data: {
        card: card,
      },
    });
    dialogRef.closed.subscribe((output) => {
      if (output) {
        console.log(output);
      }
    });
  }

  getBoard(id:string){
    this.boardsService.getBoard(id).subscribe(board=>{
      this.board = board;
      this.boardsService.setBackgroundColor(this.board.backgroundColor)
    })
  }

  updateCard(card: Card, position: number, listId:string){
    this.cardsService.update(card.id, {position, listId})
    .subscribe((cardUpdated)=>{
      console.log(cardUpdated)
    });
  }

  openCardForm(list:List){
    if(this.board?.lists){
      this.board.lists = this.board.lists.map(iteratorList =>{
        if(iteratorList.id === list.id){
          return {
            ...iteratorList,
            showCardForm: true,
          }
        }
        return {
          ...iteratorList,
          showCardForm: false
        }
      })
    }
  }

  createCard(list:List){
    const title = this.inputCard.value;

    this.cardsService.create({
      title,
      listId: list.id,
      boardId: this.board?.id,
      position: this.boardsService.getPositionNewItem(list.cards).toString()
    })
    .subscribe(card=>{
      console.log(card)
      this.inputCard.setValue('');
      list.showCardForm = false;
      list.cards.push(card)
    })
    console.log(title);
  }

  closeCardForm(list:List){
    list.showCardForm = false;
  }

  addList(){
    const title = this.inputList.value;
    if(this.board){
      this.listsService.create({
        title,
        boardId: this.board?.id,
        position: this.boardsService.getPositionNewItem(this.board.lists)

      }).subscribe(list=>{
        this.board?.lists.push({
          ...list,
          cards: []
        })
      })
      this.inputList.setValue('');
      this.showListForm = false;
    }
  }

  get colors(){
    if(this.board){
      const classes = this.colorBackgrounds[this.board.backgroundColor];
      return classes ? classes : {};
    }
    return {}
  }


}
