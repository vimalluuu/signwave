import {Component, inject, OnInit, Output, EventEmitter} from '@angular/core';
import {Store} from '@ngxs/store';
import {takeUntil, tap} from 'rxjs/operators';
import {BaseComponent} from '../../../components/base/base.component';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar} from '@ionic/angular/standalone';
import {TranslateInputButtonComponent} from '../input/button/button.component';
import {LanguageSelectorsComponent} from '../language-selectors/language-selectors.component';
import {SendFeedbackComponent} from '../send-feedback/send-feedback.component';
import {TranslocoPipe} from '@jsverse/transloco';
import {NtkmeButtonModule} from '@ctrl/ngx-github-buttons';
import {SpokenToSignedComponent} from '../spoken-to-signed/spoken-to-signed.component';
import {SignedToSpokenComponent} from '../signed-to-spoken/signed-to-spoken.component';
import {DropPoseFileComponent} from '../drop-pose-file/drop-pose-file.component';
import {addIcons} from 'ionicons';
import {
  cloudUpload,
  informationCircleOutline,
  language,
  videocam,
  downloadOutline,
  phonePortraitOutline,
  watchOutline,
} from 'ionicons/icons';
import {RouterLink} from '@angular/router';
import {LogoComponent} from '../../../components/logo/logo.component';
import {AnnouncementBannerComponent} from '../../../components/announcement-banner/announcement-banner.component';
import {LandingFooterComponent} from '../../landing/landing-footer/landing-footer.component';
import {PwaInstallService} from '../../../core/services/pwa-install/pwa-install.service';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-translate-desktop',
  templateUrl: './translate-desktop.component.html',
  styleUrls: ['./translate-desktop.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    IonTitle,
    IonIcon,
    TranslateInputButtonComponent,
    LanguageSelectorsComponent,
    SendFeedbackComponent,
    TranslocoPipe,
    SpokenToSignedComponent,
    SignedToSpokenComponent,
    DropPoseFileComponent,
    IonButton,
    RouterLink,
    LogoComponent,
    AnnouncementBannerComponent,
    LandingFooterComponent,
    AsyncPipe,
  ],
})
export class TranslateDesktopComponent extends BaseComponent implements OnInit {
  @Output() switchToMobile = new EventEmitter<void>();
  @Output() switchToSmartband = new EventEmitter<void>();
  private store = inject(Store);
  spokenToSigned$ = this.store.select<boolean>(state => state.translate.spokenToSigned);
  pwa = inject(PwaInstallService);

  pages = [
    {key: 'home', route: '/'},
    {key: 'contribute', route: '/about/contribute'},
    {key: 'settings', route: '/settings'},
  ];

  spokenToSigned: boolean;

  constructor() {
    super();

    addIcons({
      language,
      videocam,
      cloudUpload,
      informationCircleOutline,
      downloadOutline,
      phonePortraitOutline,
      watchOutline,
    });
  }

  ngOnInit(): void {
    this.spokenToSigned$
      .pipe(
        tap(spokenToSigned => (this.spokenToSigned = spokenToSigned)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();
  }
}
