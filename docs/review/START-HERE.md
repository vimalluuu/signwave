# Sign Wave: today's college review

Prepared from the local project on 3 November 2026. Read this first, then [the complete explanation](PROJECT-REVIEW.md), then use [the file reference](FILE-REFERENCE.md) when opening code.

## A 90-second introduction you can say

“My project is Sign Wave, an accessibility application that explores communication between spoken and signed languages. It is built with Angular and Ionic, with Capacitor projects for Android and iOS and progressive web app support.

“In the text-to-sign direction, a user types a sentence or uses browser speech recognition. The application maintains the text and selected languages in an NGXS store. It requests a sign pose sequence from an external translation service and renders the sequence as a skeleton animation. A separate translation path produces Sutton SignWriting symbols. Downloadable Bergamot models support a local SignWriting translation path using WebAssembly.

“The Live Sign Reader is a separate camera-based prototype. MediaPipe finds 21 landmarks on a hand. I smooth and normalize those coordinates, calculate finger positions and distances, and apply geometric rules to classify supported alphabet poses. Recognized letters are joined into words, and browser speech synthesis can read the assembled text.

“The application builds on the existing sign/translate project and pretrained models. The current scope includes frontend integration and a limited gesture-reading prototype. Continuous sign-language sentence recognition, complete alphabet coverage, and real wristband hardware integration remain future work.”

Use “I” only for work you personally performed. The code establishes what is present; it cannot establish who authored each change.

## The three flows to remember

```text
Typed text OR microphone -> browser speech-to-text -> NGXS translation state
  |-> external text-to-pose API -> pose-viewer -> skeleton -> playable video
  |-> local Bergamot OR online SignWriting API -> SignWriting symbols

Camera -> MediaPipe -> 21 hand landmarks -> smoothing -> normalization
       -> geometric rules -> letter -> word/text -> browser voice

Playground camera/video -> MediaPipe -> body/face/hand landmarks
       -> optional pose overlay, SignWriting feature analysis, signing detector, avatar experiments
```

## Five facts that will protect you in the viva

1. **MediaPipe detects landmarks; your Live Reader's letter classifier uses rules.** Do not describe that classifier as your trained neural network.
2. **The original signed-to-spoken screen uses `FAKE_WORDS`.** Its sample “What is your name?” output is time-based demonstration data, not a prediction from arbitrary video.
3. **The Live Reader is fingerspelling, not sentence understanding.** Joining letters does not implement sign-language grammar or word-level recognition.
4. **The wristband is a screen mockup.** This repository contains no implemented Bluetooth link, sensor firmware, or physical wristband protocol.
5. **Offline support is partial.** Local SignWriting models and cached assets exist; the normal text-to-pose request still targets the online service. There is also an offline result-filtering defect described in the full guide.

## Show these files if asked “where is it implemented?”

| What they ask                  | Open this file under the project root                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Application routes             | `src/app/app.routes.ts`                                                                       |
| Translation control            | `src/app/modules/translate/translate.state.ts`                                                |
| API that supplies movements    | `src/app/modules/translate/translate.service.ts`                                              |
| Offline/online SignWriting     | `src/app/modules/translate/signwriting-translation.service.ts`                                |
| Camera and letter-to-text flow | `src/app/pages/live-sign-reader/live-sign-reader.component.ts`                                |
| Letter recognition rules       | `src/app/modules/hand-gesture/hand-gesture-recognition.service.ts`                            |
| Skeleton rendering             | `src/app/pages/translate/pose-viewers/skeleton-pose-viewer/skeleton-pose-viewer.component.ts` |
| Pretrained model files         | `src/assets/models/`                                                                          |
| Server/API functions           | `functions/src/`                                                                              |

## A five-minute demonstration

1. Start with `npm start`, open `http://localhost:4200`, and explain the two language selectors. Default source is English; default target code `ase` represents ASL.
2. Enter a short sentence that you have already tested. Explain that pose animation and SignWriting are separate requests. If the remote service rejects the request, explain the dependency and show the code; do not claim a local recognition problem.
3. Show microphone input only if speech recognition works in that browser. It is configured for a single recognition session with interim results, not continuous listening.
4. Open `http://localhost:4200/live-sign-reader`. Allow camera access, use good light and one upright hand, and demonstrate only poses you have personally confirmed. Use Space, Delete, Clear, Copy and Speak.
5. Show Mobile View and Smartband View as interface demonstrations.
6. Finish with the limitations and next steps. Avoid presenting the original reverse translation screen as working general recognition.

## Short answers to memorize

- **What makes the signs move?** An external service supplies time-indexed pose coordinates; `pose-viewer` draws the body and hands, and the app can encode the rendered frames into a video.
- **What recognizes my hand?** MediaPipe's pretrained vision model estimates landmarks. The Live Reader compares their geometry against letter rules.
- **What is a landmark?** A numbered point such as the wrist or a finger joint, represented by x, y and z coordinates.
- **Why normalize?** Subtracting the wrist removes hand position; dividing by a palm reference length reduces sensitivity to distance from the camera. This does not remove rotation sensitivity.
- **Why smooth?** To reduce frame-to-frame jitter using `0.6 × previous + 0.4 × current`.
- **What is SignWriting?** A writing system describing signs using hand, body, face and movement symbols; it is different from animated pose data.
- **What database?** Backend translation/normalization caches use Firebase Realtime Database. Model files use Cloud Storage. Gesture letters are held in memory, not saved to a database.
- **What accuracy?** No measured recognition accuracy or validation dataset is included. The confidence percentages in the rule classifier are fixed values, not measured accuracy.
- **What did you train?** Training code for the main models is not included here. Explain your actual contributions as integration, UI, preprocessing and rule implementation where applicable.
- **What is the next improvement?** Correct overlapping rules and timing logic, add motion recognition, evaluate with multiple signers, then replace limited rules with a properly trained and tested model.

## Current verification

See the validation section in [PROJECT-REVIEW.md](PROJECT-REVIEW.md) for the exact checks and their outcomes. A successful compile does not establish translation quality or camera recognition accuracy.
