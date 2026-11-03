import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  viewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {IonButton, IonIcon} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {
  arrowBackOutline,
  cameraOutline,
  cameraReverseOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  copyOutline,
  handRightOutline,
  micOffOutline,
  refreshOutline,
  trashOutline,
  volumeHighOutline,
} from 'ionicons/icons';
import {
  HandGestureRecognitionService,
  GestureResult,
} from '../../modules/hand-gesture/hand-gesture-recognition.service';
import {MediapipeHolisticService} from '../../core/services/holistic.service';

interface RecognizedLetter {
  letter: string;
  timestamp: number;
  confidence: number;
}

@Component({
  selector: 'app-live-sign-reader',
  standalone: true,
  templateUrl: './live-sign-reader.component.html',
  styleUrls: ['./live-sign-reader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, IonButton, IonIcon],
})
export class LiveSignReaderComponent implements AfterViewInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private gestureService = inject(HandGestureRecognitionService);
  private holisticService = inject(MediapipeHolisticService);

  readonly videoEl = viewChild<ElementRef<HTMLVideoElement>>('videoEl');
  readonly canvasEl = viewChild<ElementRef<HTMLCanvasElement>>('canvasEl');

  // State
  isLoading = true;
  isRunning = false;
  loadingMessage = 'Initializing MediaPipe...';
  cameraError: string | null = null;

  // Recognition
  currentGesture: GestureResult = {letter: '', confidence: 0, handedness: 'none'};
  recognizedLetters: RecognizedLetter[] = [];
  builtSentence = '';
  currentWord = '';
  recentLetters: string[] = [];
  isSpeaking = false;
  handVisible = false;

  // Debounce tracking
  private lastAddedLetter = '';
  private lastLetterTime = 0;
  private readonly LETTER_HOLD_MS = 800;
  private readonly SAME_LETTER_DELAY_MS = 1500;

  // Camera
  private stream: MediaStream | null = null;
  private holisticModel: any = null;
  private animFrameId: number | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  // Holistic drawing utils
  private drawUtils: any = null;

  constructor() {
    addIcons({
      arrowBackOutline,
      cameraOutline,
      cameraReverseOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      copyOutline,
      handRightOutline,
      micOffOutline,
      refreshOutline,
      trashOutline,
      volumeHighOutline,
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initCamera();
    await this.initHolistic();
    this.startLoop();
  }

  private async initCamera(): Promise<void> {
    this.loadingMessage = 'Requesting camera access...';
    this.cdr.markForCheck();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {width: {ideal: 1280}, height: {ideal: 720}, facingMode: 'user'},
        audio: false,
      });

      const video = this.videoEl()?.nativeElement;
      if (video) {
        video.srcObject = this.stream;
        await video.play();
      }
    } catch (err: any) {
      this.cameraError = `Camera error: ${err.message || 'Permission denied'}`;
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private async initHolistic(): Promise<void> {
    this.loadingMessage = 'Loading hand tracking models...';
    this.cdr.markForCheck();

    try {
      await this.holisticService.load();

      const holistic = this.holisticService;

      this.holisticModel = new holistic.Holistic({
        locateFile: (file: string) => `assets/models/holistic/${file}`,
      });

      this.holisticModel.setOptions({
        upperBodyOnly: true,
        modelComplexity: 0,
        smoothLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });

      // Import drawing utils
      const drawingModule = await import(
        /* webpackChunkName: "@mediapipe/drawing_utils" */ '@mediapipe/drawing_utils/drawing_utils.js'
      );
      this.drawUtils = drawingModule;

      this.holisticModel.onResults((results: any) => this.onHolisticResults(results));

      await this.holisticModel.initialize();

      this.loadingMessage = 'Ready!';
      this.isLoading = false;
      this.isRunning = true;
      this.cdr.markForCheck();
    } catch (err: any) {
      this.loadingMessage = `Error: ${err.message}`;
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private startLoop(): void {
    const loop = async () => {
      const video = this.videoEl()?.nativeElement;
      if (video && this.holisticModel && !video.paused && !video.ended && video.readyState >= 2) {
        await this.holisticModel.send({image: video});
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private onHolisticResults(results: any): void {
    const canvas = this.canvasEl()?.nativeElement;
    const video = this.videoEl()?.nativeElement;
    if (!canvas || !video) return;

    // Get/create context
    if (!this.canvasCtx) {
      this.canvasCtx = canvas.getContext('2d')!;
    }
    const ctx = this.canvasCtx;

    // Match canvas to video size
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mirrored video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Detect hand presence
    const hasRight = results.rightHandLandmarks?.length === 21;
    const hasLeft = results.leftHandLandmarks?.length === 21;
    this.handVisible = hasRight || hasLeft;

    // Draw hand landmarks
    if (this.drawUtils) {
      this.drawHandLandmarks(ctx, canvas, results);
    }

    // Gesture recognition
    const gesture = this.gestureService.recognize(results);
    this.currentGesture = gesture;

    // Letter debounce logic
    if (gesture.letter && gesture.letter !== '?' && gesture.confidence > 0.65 && this.handVisible) {
      const now = Date.now();
      const isSameLetter = gesture.letter === this.lastAddedLetter;
      const heldLongEnough =
        now - this.lastLetterTime > (isSameLetter ? this.SAME_LETTER_DELAY_MS : this.LETTER_HOLD_MS);

      if (heldLongEnough) {
        this.addLetter(gesture.letter);
        this.lastAddedLetter = gesture.letter;
        this.lastLetterTime = now;
      }
    }

    this.cdr.markForCheck();
  }

  private drawHandLandmarks(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, results: any): void {
    const dw = this.drawUtils;

    const mirrorLandmarks = (lm: any[]) => lm?.map(l => ({...l, x: 1 - l.x}));

    const draw = (landmarks: any[], connections: any, lineColor: string, dotColor: string) => {
      if (!landmarks) return;
      const mirrored = mirrorLandmarks(landmarks);
      dw.drawConnectors(ctx, mirrored, connections, {color: lineColor, lineWidth: 2});
      dw.drawLandmarks(ctx, mirrored, {
        color: dotColor,
        fillColor: lineColor,
        lineWidth: 1,
        radius: (lm: any) => dw.lerp(lm.z, -0.15, 0.1, 8, 1),
      });
    };

    // Draw body pose (upper body)
    if (results.poseLandmarks && this.holisticService.POSE_CONNECTIONS) {
      const mirroredPose = mirrorLandmarks(results.poseLandmarks);
      dw.drawConnectors(ctx, mirroredPose, this.holisticService.POSE_CONNECTIONS, {
        color: 'rgba(0,255,255,0.3)',
        lineWidth: 1,
      });
    }

    // Draw right hand (user's right = mirror left on screen)
    draw(results.rightHandLandmarks, this.holisticService.HAND_CONNECTIONS, '#00ff88', '#00ffcc');

    // Draw left hand
    draw(results.leftHandLandmarks, this.holisticService.HAND_CONNECTIONS, '#ff6b6b', '#ff9f9f');
  }

  private addLetter(letter: string): void {
    if (letter === ' ') {
      if (this.currentWord.trim()) {
        this.builtSentence += (this.builtSentence ? ' ' : '') + this.currentWord;
        this.currentWord = '';
      }
    } else {
      this.currentWord += letter;
    }

    this.recognizedLetters.unshift({
      letter,
      timestamp: Date.now(),
      confidence: this.currentGesture.confidence,
    });

    // Keep last 20 recent letters
    this.recentLetters = [letter, ...this.recentLetters].slice(0, 20);

    if (this.recognizedLetters.length > 50) {
      this.recognizedLetters.pop();
    }
  }

  deleteLastLetter(): void {
    if (this.currentWord.length > 0) {
      this.currentWord = this.currentWord.slice(0, -1);
    } else if (this.builtSentence.length > 0) {
      const parts = this.builtSentence.split(' ');
      this.currentWord = parts.pop() || '';
      this.builtSentence = parts.join(' ');
    }
    this.recentLetters = this.recentLetters.slice(1);
    this.recognizedLetters = this.recognizedLetters.slice(1);
    this.cdr.markForCheck();
  }

  addSpaceManually(): void {
    if (this.currentWord.trim()) {
      this.builtSentence += (this.builtSentence ? ' ' : '') + this.currentWord;
      this.currentWord = '';
      this.cdr.markForCheck();
    }
  }

  clearAll(): void {
    this.builtSentence = '';
    this.currentWord = '';
    this.recognizedLetters = [];
    this.recentLetters = [];
    this.lastAddedLetter = '';
    this.lastLetterTime = 0;
    this.cdr.markForCheck();
  }

  get fullText(): string {
    const word = this.currentWord.trim();
    const sentence = this.builtSentence;
    if (sentence && word) return sentence + ' ' + word;
    if (sentence) return sentence;
    return word;
  }

  copyText(): void {
    navigator.clipboard.writeText(this.fullText).catch(console.error);
  }

  speakText(): void {
    if (!('speechSynthesis' in window) || !this.fullText) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(this.fullText);
    utter.lang = 'en-US';
    utter.rate = 0.9;
    this.isSpeaking = true;
    utter.onend = () => {
      this.isSpeaking = false;
      this.cdr.markForCheck();
    };
    this.cdr.markForCheck();
    window.speechSynthesis.speak(utter);
  }

  getConfidencePercent(): number {
    return Math.round(this.currentGesture.confidence * 100);
  }

  getConfidenceColor(): string {
    const c = this.currentGesture.confidence;
    if (c > 0.8) return '#00ff88';
    if (c > 0.65) return '#ffd700';
    return '#ff6b6b';
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    if (this.holisticModel) {
      this.holisticModel.close?.();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}
