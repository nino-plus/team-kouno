import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import firebase from 'firebase/app';
import 'quill-emoji/dist/quill-emoji.js';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, skip } from 'rxjs/operators';
import { ChatWithUser } from 'src/app/interfaces/chat';
import { EventWithOwner } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { ChatService } from 'src/app/services/chat.service';
import { SoundService } from 'src/app/services/sound.service';
import { UiService } from 'src/app/services/ui.service';

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

  modules = {
    'emoji-shortname': true,
    'emoji-toolbar': true,
    toolbar: [['emoji'], ['link', 'video']],
  };

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
