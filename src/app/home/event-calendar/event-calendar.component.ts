import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { EventDetailDialogComponent } from '../event-detail-dialog/event-detail-dialog.component';

const colors: any = {
  main: {
    primary: '#1bcbe0',
    secondary: '#FAE3E3',
  },
  pink: {
    primary: '#F891A8',
    secondary: '#D1E8FF',
  },
  orange: {
    primary: '#ed9309',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-event-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.scss'],
})
export class EventCalendarComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  @Input() eventLists: Event[];
  @Input() uid: string;

  reserveEvents$: Observable<Event[]> = this.authService.user$.pipe(
    switchMap((user) => {
      return this.eventService.getReservedEvent(user.uid);
    })
  );

  calendarEventLists = [];

  private readonly weekList = ['日', '月', '火', '水', '木', '金', '土'];
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  CalendarView = CalendarView;

  activeDayIsOpen: boolean;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = this.calendarEventLists;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log(this.view);
    console.log(this.viewDate);

    this.reserveEvents$.pipe(take(1)).subscribe((events) => {
      events.forEach((event) => {
        this.calendarEventLists.push({
          id: event.eventId,
          start: event.startAt.toDate(),
          end: event.exitAt ? event.exitAt.toDate() : '',
          title: event.name,
          color: colors.main,
          actions: this.actions,
          resizable: {
            beforeStart: true,
            afterEnd: true,
          },
          draggable: true,
        });
      });
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.openDetailDialog(event.id);
    console.log(event);
  }

  setView(view: CalendarView): void {
    this.view = view;
    console.log(view);
  }

  closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
  }

  openDetailDialog(eventId: any): void {
    const eventData$ = this.eventService.getEvent(eventId);
    eventData$.subscribe((data) => {
      const eventData = data;
      this.dialog.open(EventDetailDialogComponent, {
        data: {
          event: eventData,
          uid: this.uid,
        },
      });
    });
  }
}
