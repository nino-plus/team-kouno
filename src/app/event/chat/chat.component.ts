import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ChatWithUser } from 'src/app/interfaces/chat';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import 'quill-emoji/dist/quill-emoji.js';
import { UiService } from 'src/app/services/ui.service';
import { shareReplay, skip } from 'rxjs/operators';
import { SoundService } from 'src/app/services/sound.service';
import firebase from 'firebase/app';
import { User } from 'src/app/interfaces/user';
import { Event, EventWithOwner } from 'src/app/interfaces/event';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  @Input() eventId: string;
  @Input() uid: string;
  @Input() participants: User[];
  @Input() event: EventWithOwner;
  @ViewChild('target') target: ElementRef;
  form = new FormControl();
  chats$: Observable<ChatWithUser[]>;

  constructor(
    private chatService: ChatService,
    public uiService: UiService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.chats$ = this.chatService.getChatsWithUser(this.eventId);

    if (this.eventId) {
      this.subscription.add(
        this.chats$.pipe(skip(1), shareReplay(1)).subscribe((chats) => {
          const lastChat = chats.slice(-1)[0];
          const now = firebase.firestore.Timestamp.now().toMillis() - 10000;

          if (
            this.eventId == lastChat.eventId &&
            lastChat.createdAt.toMillis() >= now
          ) {
            this.soundService.postSound.play();
          }

          if (this.uiService.isOpen) {
            setTimeout(() => {
              this.target?.nativeElement.scrollIntoView(false);
            }, 1000);
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
