import {Component, inject, OnInit} from '@angular/core';
import {IonButton, IonIcon} from '@ionic/angular/standalone';
import {TranslocoPipe} from '@jsverse/transloco';
import {addIcons} from 'ionicons';
import {desktopOutline, wifi, batteryCharging, micOutline, stopCircleOutline, watchOutline} from 'ionicons/icons';
import {SetSpokenLanguageText} from '../../modules/translate/translate.actions';
import {Store} from '@ngxs/store';
import {SetSetting} from '../../modules/settings/settings.actions';
import {fromEvent, Observable} from 'rxjs';
import {BaseComponent} from '../../components/base/base.component';
import {filter, takeUntil, tap} from 'rxjs/operators';
import {TranslocoService} from '@jsverse/transloco';
import {TranslationService} from '../../modules/translate/translate.service';
import {Meta, Title} from '@angular/platform-browser';
import {MediaMatcher} from '@angular/cdk/layout';
import {TranslateMobileComponent} from './translate-mobile/translate-mobile.component';
import {TranslateDesktopComponent} from './translate-desktop/translate-desktop.component';
import {SignedLanguageOutputComponent} from './spoken-to-signed/signed-language-output/signed-language-output.component';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss'],
  imports: [
    TranslateMobileComponent,
    TranslateDesktopComponent,
    SignedLanguageOutputComponent,
    IonButton,
    IonIcon,
    TranslocoPipe,
  ],
})
export class TranslateComponent extends BaseComponent implements OnInit {
  private store = inject(Store);
  private transloco = inject(TranslocoService);
  translation = inject(TranslationService);
  private mediaMatcher = inject(MediaMatcher);
  private meta = inject(Meta);
  private title = inject(Title);

  spokenToSigned$: Observable<boolean>;

  isMobile: MediaQueryList;
  mobileOverride: boolean | null = null;

  get isMobileView(): boolean {
    if (this.mobileOverride !== null) {
      return this.mobileOverride;
    }
    return this.isMobile.matches;
  }

  setMobileOverride(value: boolean): void {
    this.mobileOverride = value;
    if (value) {
      this.smartbandOverride = false;
    }
  }

  smartbandOverride = false;
  speechRecognitionSmartband: any;
  isSmartbandRecording = false;
  smartbandSpokenText = '';
  SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

  initSmartbandSpeech(): void {
    if (!this.SpeechRecognition) {
      return;
    }
    this.speechRecognitionSmartband = new this.SpeechRecognition();
    this.speechRecognitionSmartband.interimResults = true;
    this.speechRecognitionSmartband.continuous = false;
    this.speechRecognitionSmartband.lang = 'en';

    fromEvent(this.speechRecognitionSmartband, 'result').subscribe((event: any) => {
      const transcription = event.results[0][0].transcript;
      this.smartbandSpokenText = transcription;
      this.store.dispatch(new SetSpokenLanguageText(transcription));
    });

    fromEvent(this.speechRecognitionSmartband, 'start').subscribe(() => {
      this.isSmartbandRecording = true;
      this.smartbandSpokenText = 'Listening...';
      this.store.dispatch(new SetSpokenLanguageText(''));
    });

    fromEvent(this.speechRecognitionSmartband, 'end').subscribe(() => {
      this.isSmartbandRecording = false;
      this.speechRecognitionSmartband.stop();
    });

    fromEvent(this.speechRecognitionSmartband, 'error').subscribe((err: any) => {
      console.error(err);
      this.isSmartbandRecording = false;
    });
  }

  toggleSmartbandRecording(): void {
    if (!this.speechRecognitionSmartband) {
      this.initSmartbandSpeech();
    }
    if (!this.speechRecognitionSmartband) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (this.isSmartbandRecording) {
      this.speechRecognitionSmartband.stop();
    } else {
      this.speechRecognitionSmartband.start();
    }
  }

  constructor() {
    super();

    addIcons({desktopOutline, wifi, batteryCharging, micOutline, stopCircleOutline, watchOutline});

    this.spokenToSigned$ = this.store.select<boolean>(state => state.translate.spokenToSigned);
    this.isMobile = this.mediaMatcher.matchMedia('screen and (max-width: 599px)');

    // Default settings
    this.store.dispatch([
      new SetSetting('receiveVideo', true),
      new SetSetting('detectSign', false),
      new SetSetting('drawSignWriting', false), // This setting currently also controls loading the SignWriting models.
      new SetSetting('drawPose', true),
      new SetSetting('poseViewer', 'pose'),
    ]);
  }

  ngOnInit(): void {
    this.transloco.events$
      .pipe(
        tap(() => {
          this.title.setTitle(this.transloco.translate('translate.title'));
          this.meta.updateTag(
            {
              name: 'description',
              content: this.transloco.translate('translate.description'),
            },
            'name=description'
          );
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.spokenToSigned$
      .pipe(
        filter(spokenToSigned => !spokenToSigned),
        tap(() => {
          this.store.dispatch(new SetSetting('drawSignWriting', true));
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.playVideos();
  }

  async playVideos(): Promise<void> {
    if (!('window' in globalThis)) {
      return;
    }

    // Autoplay videos don't play before page interaction, or after re-opening PWA without refresh
    fromEvent(window, 'click')
      .pipe(
        tap(async () => {
          const videos = Array.from(document.getElementsByTagName('video'));

          for (const video of videos) {
            if (video.autoplay && video.paused) {
              try {
                await video.play();
              } catch (e) {
                console.error(e);
              }
            }
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();
  }
}
