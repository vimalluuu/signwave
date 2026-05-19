import {Component} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {alertCircleOutline, code, language, build} from 'ionicons/icons';
import {NtkmeButtonModule} from '@ctrl/ngx-github-buttons';

@Component({
  selector: 'app-contribute',
  templateUrl: './contribute.component.html',
  styleUrls: ['./contribute.component.scss'],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    NtkmeButtonModule,
  ],
})
export class ContributeComponent {
  cards = [
    {
      id: 'develop',
      icon: 'code',
      title: 'Develop',
      subtitle: 'Help us build the future of wearable translation.',
      content:
        'By contributing to the development of the Sign Wave wristband and app, you can help improve the AI algorithms, optimize the voice output, and implement new features. You can find our projects on GitHub and start contributing today. Every line of code counts!',
      action: {
        text: 'View on GitHub',
        url: 'https://github.com/vimalluuu',
      },
    },
    {
      id: 'hardware',
      icon: 'build',
      title: 'Hardware & Wearables',
      subtitle: 'Contribute to the wristband hardware design.',
      content:
        'Sign Wave is more than just software. We are actively developing a wristband that reads sign language gestures. If you have experience in IoT, wearables, or embedded systems, we need your help to make our hardware functional and reliable.',
      action: {
        text: 'Join the Discussion',
        url: 'https://github.com/vimalluuu',
      },
    },
    {
      id: 'feedback',
      icon: 'alert-circle-outline',
      title: 'Provide Feedback',
      subtitle: 'Let us know how to make Sign Wave better!',
      content:
        'By providing feedback, you can help us refine the Sign Wave user experience. Whether you have a suggestion for the wristband, or you found a bug in the app, your feedback is invaluable to our team. Every voice counts!',
      action: {
        text: 'Give Feedback',
        url: 'mailto:vimallu.personal@gmail.com',
      },
    },
  ];

  constructor() {
    addIcons({code, language, alertCircleOutline, build});
  }
}
