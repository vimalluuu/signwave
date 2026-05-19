import {Component, Output, EventEmitter} from '@angular/core';
import {TranslateDesktopComponent} from '../translate-desktop/translate-desktop.component';
import {IonContent, IonFooter, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon} from '@ionic/angular/standalone';
import {SpokenLanguageInputComponent} from '../spoken-to-signed/spoken-language-input/spoken-language-input.component';
import {SignedLanguageOutputComponent} from '../spoken-to-signed/signed-language-output/signed-language-output.component';
import {SignedLanguageInputComponent} from '../signed-to-spoken/signed-language-input/signed-language-input.component';
import {LanguageSelectorsComponent} from '../language-selectors/language-selectors.component';
import {VideoModule} from '../../../components/video/video.module';
import {addIcons} from 'ionicons';
import {desktopOutline} from 'ionicons/icons';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-translate-mobile',
  templateUrl: './translate-mobile.component.html',
  styleUrls: ['./translate-mobile.component.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonFooter,
    IonButtons,
    IonButton,
    IonIcon,
    SignedLanguageOutputComponent,
    SignedLanguageInputComponent,
    SpokenLanguageInputComponent,
    VideoModule,
    LanguageSelectorsComponent,
    TranslocoPipe,
  ],
})
export class TranslateMobileComponent extends TranslateDesktopComponent {
  @Output() switchToDesktop = new EventEmitter<void>();

  constructor() {
    super();
    addIcons({desktopOutline});
  }
}
