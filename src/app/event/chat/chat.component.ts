import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatWithUser } from 'src/app/interfaces/chat';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import 'quill-emoji/dist/quill-emoji.js';
import { UiService } from 'src/app/services/ui.service';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @Input() eventId: string;
  @ViewChild('target') target: ElementRef;
  uid = this.authService.uid;
  form = new FormControl();
  chats$: Observable<ChatWithUser[]>;
  isShow: boolean;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.chats$ = this.chatService.getChatsWithUser(this.eventId);
    this.chats$.pipe(shareReplay(1)).subscribe(() => {
      if (this.uiService.isOpen) {
        setTimeout(() => {
          this.target.nativeElement.scrollIntoView(false);
        }, 1000);
      }
    });
  }

  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     this.target.nativeElement.scrollIntoView(false);
  //   }, 1000);
  // }

  toggleToolBar() {
    this.isShow = !this.isShow;
    console.log(this.isShow);
  }

  createChat(): void {
    if (this.form.value) {
      const chat = { chatBody: this.form.value };
      this.chatService.createChat(this.eventId, this.uid, chat);
    }
    this.form.reset();
  }

  deleteChat(chatId): void {
    this.chatService.deleteChat(this.eventId, chatId);
  }
}
