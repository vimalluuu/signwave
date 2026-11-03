import {inject, Injectable} from '@angular/core';
import {MediapipeHolisticService} from '../../core/services/holistic.service';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureResult {
  letter: string;
  confidence: number;
  handedness: 'left' | 'right' | 'both' | 'none';
}

@Injectable({
  providedIn: 'root',
})
export class HandGestureRecognitionService {
  private _holistic = inject(MediapipeHolisticService);

  // EMA state for smoothing landmarks
  private previousLandmarks: HandLandmark[] | null = null;
  private readonly SMOOTHING_FACTOR = 0.6; // Higher = more smoothing, less responsive

  private angle(a: HandLandmark, b: HandLandmark, c: HandLandmark): number {
    const ab = {x: a.x - b.x, y: a.y - b.y};
    const cb = {x: c.x - b.x, y: c.y - b.y};
    const dot = ab.x * cb.x + ab.y * cb.y;
    const cross = ab.x * cb.y - ab.y * cb.x;
    return Math.atan2(Math.abs(cross), dot) * (180 / Math.PI);
  }

  private dist(a: HandLandmark, b: HandLandmark): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }

  private normalizeLandmarks(lm: HandLandmark[]): HandLandmark[] {
    const wrist = lm[0];
    const midMcp = lm[9]; // Middle finger MCP
    const scale = this.dist(wrist, midMcp) || 1;
    return lm.map(l => ({
      x: (l.x - wrist.x) / scale,
      y: (l.y - wrist.y) / scale,
      z: (l.z - wrist.z) / scale,
    }));
  }

  private smoothLandmarks(lm: HandLandmark[]): HandLandmark[] {
    if (!this.previousLandmarks) {
      this.previousLandmarks = lm;
      return lm;
    }

    const smoothed = lm.map((current, i) => {
      const prev = this.previousLandmarks![i];
      return {
        x: prev.x * this.SMOOTHING_FACTOR + current.x * (1 - this.SMOOTHING_FACTOR),
        y: prev.y * this.SMOOTHING_FACTOR + current.y * (1 - this.SMOOTHING_FACTOR),
        z: prev.z * this.SMOOTHING_FACTOR + current.z * (1 - this.SMOOTHING_FACTOR),
      };
    });

    this.previousLandmarks = smoothed;
    return smoothed;
  }

  public resetSmoothing(): void {
    this.previousLandmarks = null;
  }

  classifyASL(rawLm: HandLandmark[], handedness: 'left' | 'right'): {letter: string; confidence: number} {
    if (!rawLm || rawLm.length < 21) {
      return {letter: '', confidence: 0};
    }

    const smoothed = this.smoothLandmarks(rawLm);
    const n = this.normalizeLandmarks(smoothed);

    // Advanced finger states
    const thumbExt = this.dist(n[0], n[4]) > this.dist(n[0], n[3]) && this.angle(n[2], n[3], n[4]) > 140;

    // Check if fingers are fully extended
    const indexExt = n[8].y < n[6].y && this.dist(n[0], n[8]) > this.dist(n[0], n[5]) * 1.5;
    const middleExt = n[12].y < n[10].y && this.dist(n[0], n[12]) > this.dist(n[0], n[9]) * 1.5;
    const ringExt = n[16].y < n[14].y && this.dist(n[0], n[16]) > this.dist(n[0], n[13]) * 1.5;
    const pinkyExt = n[20].y < n[18].y && this.dist(n[0], n[20]) > this.dist(n[0], n[17]) * 1.5;

    // Check if fingers are curled/closed
    const indexClosed = n[8].y > n[5].y;
    const middleClosed = n[12].y > n[9].y;
    const ringClosed = n[16].y > n[13].y;
    const pinkyClosed = n[20].y > n[17].y;

    const allFingersClosed = indexClosed && middleClosed && ringClosed && pinkyClosed;

    // Distances
    const thumbToIndexTip = this.dist(n[4], n[8]);
    const thumbToMiddleTip = this.dist(n[4], n[12]);
    const thumbToRingTip = this.dist(n[4], n[16]);
    const thumbToPinkyTip = this.dist(n[4], n[20]);
    const indexToMiddleTip = this.dist(n[8], n[12]);

    // Thumb relative positions
    const thumbOverIndex = n[4].x > n[6].x; // For right hand (needs flip for left)
    const isRight = handedness === 'right';

    // X-axis relations based on hand
    const thumbInside = isRight ? n[4].x < n[5].x : n[4].x > n[5].x;
    const thumbOutside = isRight ? n[4].x > n[5].x : n[4].x < n[5].x;
    const thumbBetweenIndexMiddle = isRight ? n[4].x > n[9].x && n[4].x < n[5].x : n[4].x < n[9].x && n[4].x > n[5].x;
    const thumbBetweenMiddleRing = isRight ? n[4].x > n[13].x && n[4].x < n[9].x : n[4].x < n[13].x && n[4].x > n[9].x;
    const thumbBetweenRingPinky = isRight ? n[4].x > n[17].x && n[4].x < n[13].x : n[4].x < n[17].x && n[4].x > n[13].x;

    // Curvature (C, O, E)
    const indexCurved = !indexExt && !indexClosed && n[8].y < n[0].y;
    const middleCurved = !middleExt && !middleClosed && n[12].y < n[0].y;
    const ringCurved = !ringExt && !ringClosed && n[16].y < n[0].y;

    // Space: fully open hand spread wide
    if (indexExt && middleExt && ringExt && pinkyExt && thumbExt && this.dist(n[8], n[20]) > 0.8) {
      return {letter: ' ', confidence: 0.9};
    }

    // A: Fist with thumb to the side
    if (allFingersClosed && thumbOutside && n[4].y < n[5].y) {
      return {letter: 'A', confidence: 0.85};
    }

    // E: Fingers curled inwards, thumb tucked in touching tips
    if (indexClosed && middleClosed && ringClosed && pinkyClosed && thumbInside && n[4].y > n[5].y) {
      return {letter: 'E', confidence: 0.85};
    }

    // S: Fist with thumb crossing over fingers
    if (allFingersClosed && thumbInside && n[4].y < n[9].y) {
      return {letter: 'S', confidence: 0.85};
    }

    // T: Thumb tucked between index and middle
    if (allFingersClosed && thumbBetweenIndexMiddle && n[4].y < n[5].y) {
      return {letter: 'T', confidence: 0.8};
    }

    // N: Thumb tucked between middle and ring
    if (allFingersClosed && thumbBetweenMiddleRing && n[4].y < n[9].y) {
      return {letter: 'N', confidence: 0.8};
    }

    // M: Thumb tucked between ring and pinky
    if (allFingersClosed && thumbBetweenRingPinky && n[4].y < n[13].y) {
      return {letter: 'M', confidence: 0.8};
    }

    // O: All fingers curved meeting thumb
    if (indexCurved && middleCurved && ringCurved && thumbToIndexTip < 0.25 && thumbToMiddleTip < 0.25) {
      return {letter: 'O', confidence: 0.85};
    }

    // C: Curved hand (C shape) - large gap between thumb and index
    if (indexCurved && middleCurved && ringCurved && thumbToIndexTip > 0.4 && thumbToIndexTip < 1.0) {
      return {letter: 'C', confidence: 0.8};
    }

    // B: Four fingers up, thumb folded across palm
    if (indexExt && middleExt && ringExt && pinkyExt && thumbInside) {
      return {letter: 'B', confidence: 0.88};
    }

    // D: Index up, others curled, thumb touching middle
    if (indexExt && !middleExt && !ringExt && !pinkyExt && thumbToMiddleTip < 0.3) {
      return {letter: 'D', confidence: 0.85};
    }

    // F: Index and thumb touching, others extended
    if (!indexExt && middleExt && ringExt && pinkyExt && thumbToIndexTip < 0.25) {
      return {letter: 'F', confidence: 0.85};
    }

    // I: Pinky up, rest down
    if (!indexExt && !middleExt && !ringExt && pinkyExt && !thumbExt) {
      return {letter: 'I', confidence: 0.9};
    }

    // Y: Thumb and pinky extended
    if (!indexExt && !middleExt && !ringExt && pinkyExt && thumbExt) {
      return {letter: 'Y', confidence: 0.9};
    }

    // L: L-shape: index up, thumb out
    if (indexExt && !middleExt && !ringExt && !pinkyExt && thumbExt && thumbToIndexTip > 0.6) {
      return {letter: 'L', confidence: 0.9};
    }

    // V: Index and middle spread apart (peace sign)
    if (indexExt && middleExt && !ringExt && !pinkyExt && indexToMiddleTip > 0.3) {
      return {letter: 'V', confidence: 0.9};
    }

    // U: Index and middle up together, close
    if (indexExt && middleExt && !ringExt && !pinkyExt && indexToMiddleTip <= 0.3) {
      return {letter: 'U', confidence: 0.85};
    }

    // W: Index, middle, ring up
    if (indexExt && middleExt && ringExt && !pinkyExt) {
      return {letter: 'W', confidence: 0.85};
    }

    // R: Index and middle crossed
    if (indexExt && middleExt && !ringExt && !pinkyExt) {
      const crossed = isRight ? n[8].x > n[12].x : n[8].x < n[12].x;
      if (crossed) {
        return {letter: 'R', confidence: 0.8};
      }
    }

    // K: Index and middle up, thumb between them vertically
    if (indexExt && middleExt && !ringExt && !pinkyExt && thumbExt) {
      if (n[4].y < n[5].y && n[4].y > n[8].y) {
        return {letter: 'K', confidence: 0.8};
      }
    }

    // G: Index pointing sideways, thumb parallel
    if (!indexExt && !middleExt && !ringExt && !pinkyExt && thumbExt) {
      const indexPointingSide = Math.abs(n[8].y - n[5].y) < 0.2 && this.dist(n[8], n[5]) > 0.5;
      if (indexPointingSide) {
        return {letter: 'G', confidence: 0.8};
      }
    }

    // H: Index and middle pointing sideways together
    if (!indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt) {
      const indexPointingSide = Math.abs(n[8].y - n[5].y) < 0.2 && this.dist(n[8], n[5]) > 0.5;
      const middlePointingSide = Math.abs(n[12].y - n[9].y) < 0.2 && this.dist(n[12], n[9]) > 0.5;
      if (indexPointingSide && middlePointingSide) {
        return {letter: 'H', confidence: 0.8};
      }
    }

    // X: Index hooked/curved, others closed
    if (indexCurved && middleClosed && ringClosed && pinkyClosed) {
      return {letter: 'X', confidence: 0.8};
    }

    // P: Index and middle pointing down/forward, thumb out
    if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
      const indexPointingDown = n[8].y > n[5].y && n[8].z < n[5].z;
      const middlePointingDown = n[12].y > n[9].y && n[12].z < n[9].z;
      if (indexPointingDown && middlePointingDown && thumbExt) {
        return {letter: 'P', confidence: 0.75};
      }
    }

    // Q: Index pointing down, thumb out
    if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
      const indexPointingDown = n[8].y > n[5].y && n[8].z < n[5].z;
      if (indexPointingDown && thumbExt && middleClosed) {
        return {letter: 'Q', confidence: 0.75};
      }
    }

    // Z: Index pointing only (since we don't have motion tracking, just detect the static starting pose)
    if (indexExt && middleClosed && ringClosed && pinkyClosed && thumbInside) {
      // If it doesn't match D or X or L, it might be Z
      if (thumbToMiddleTip > 0.3) {
        return {letter: 'Z', confidence: 0.6};
      }
    }

    return {letter: '?', confidence: 0.3};
  }

  recognize(results: any): GestureResult {
    const rightLandmarks = results?.rightHandLandmarks as HandLandmark[] | undefined;
    const leftLandmarks = results?.leftHandLandmarks as HandLandmark[] | undefined;

    if (!rightLandmarks && !leftLandmarks) {
      this.resetSmoothing();
      return {letter: '', confidence: 0, handedness: 'none'};
    }

    // Prefer right hand if both are present for simplicity, or we could handle both
    if (rightLandmarks && rightLandmarks.length === 21) {
      const {letter, confidence} = this.classifyASL(rightLandmarks, 'right');
      return {letter, confidence, handedness: 'right'};
    }

    if (leftLandmarks && leftLandmarks.length === 21) {
      const {letter, confidence} = this.classifyASL(leftLandmarks, 'left');
      return {letter, confidence, handedness: 'left'};
    }

    return {letter: '', confidence: 0, handedness: 'none'};
  }
}
