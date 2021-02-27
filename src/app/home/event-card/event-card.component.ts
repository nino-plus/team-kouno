import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnInit {
  events = [
    {
      image: '/assets/images/hero-1.jpeg',
      eventDate: '3月1日',
      title: '第1回Angularハッカソン',
      info: 'チームを組んでAngularを使ったサービスを制限時間内で開発し、サービスのクオリティで競います！'
    },
    {
      image: '/assets/images/hero-2.jpeg',
      eventDate: '4月20日',
      title: '第2回Angularハッカソン',
      info: 'チームを組んでAngularを使ったサービスを制限時間内で開発し、サービスのクオリティで競います！'
    },
    {
      image: '/assets/images/hero-3.jpeg',
      eventDate: '5月14日',
      title: '第３回Angularハッカソン',
      info: 'チームを組んでAngularを使ったサービスを制限時間内で開発し、サービスのクオリティで競います！'
    }
  ];

  constructor() { }

  openDetailDialog(): void {}

  ngOnInit(): void {
  }

}
