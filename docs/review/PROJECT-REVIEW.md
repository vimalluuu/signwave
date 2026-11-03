# Sign Wave: complete project explanation

Code review prepared on 3 November 2026 for `F:\signwave`. This describes the local implementation, including existing uncommitted Live Sign Reader changes. It distinguishes implemented behavior from sample data, promotional text and research plans.

## 1. What the project is

Sign Wave is an Angular application for exploring communication between spoken language and signed language. Its main interface takes typed or recognized speech and displays signed output. It also includes a camera/video analysis playground, a separate Live Sign Reader prototype, settings, informational pages, documentation, and native platform wrappers.

The repository's README acknowledges the upstream `sign/translate` project and describes this copy as rebranded/customized. Several model references, Firebase resources, package names, application identifiers and support links still belong to the upstream project. Present it as an application built on an existing research platform and pretrained models. Do not claim every model, dataset or algorithm was developed locally.

The code alone cannot establish your individual contribution. Confirm your own work against your commit history, notes and teammates before explaining authorship.

### What is actually present

| Capability                   | Actual implementation and boundary                                                                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typed text to signing        | Frontend requests a pose sequence from the external `spoken_text_to_signed_pose` Cloud Function and renders it. The service's actual translation internals are outside this repository.                               |
| Speech to signing            | Browser speech recognition produces text, then the same text translation flow runs. Browser/provider support and permissions apply.                                                                                   |
| SignWriting output           | A separate local Bergamot or remote translation produces Formal SignWriting text, normalized and displayed with Sutton SignWriting components/fonts.                                                                  |
| Skeleton output              | Implemented with the `pose-viewer` custom element; this is the default viewer.                                                                                                                                        |
| Human appearance output      | Pix2Pix generator plus upscaler inference exists; model assets are downloaded from external storage. Working availability/performance needs a device-level demonstration.                                             |
| 3D avatar                    | Model loading and quaternion animation infrastructure exists, but the text-to-pose avatar viewer contains TODOs for passing pose tensors into the animation service. Do not claim that path is complete.              |
| Main signed-to-spoken screen | Uses a hardcoded, timed `FAKE_WORDS` sample. General video-to-text translation is not implemented there.                                                                                                              |
| Live Sign Reader             | MediaPipe landmarks plus geometric letter rules, word assembly, copy and speech synthesis. Limited, unvalidated fingerspelling prototype.                                                                             |
| Offline features             | Download/cache management and local SignWriting inference exist. Complete offline text-to-sign animation is not implemented, and an online-status filter currently suppresses successful offline SignWriting results. |
| Mobile and wearable screens  | Responsive mobile interface and a browser wristband mockup. Native Android/iOS project scaffolding exists. No hardware communication implementation was found.                                                        |
| PWA                          | Manifest, install-prompt service and production service worker configuration exist.                                                                                                                                   |

The language arrays contain **108 spoken codes and 44 signed codes**. These are selectable/requestable codes, not evidence that every pair is available or equally accurate. `ins` appears in the signed-language list, but the Live Reader is explicitly designed around ASL-style letters; it is not an Indian Sign Language recognizer.

## 2. Technology stack, in plain language

Versions below are declared in this checkout's `package.json`; they are not statements about the latest releases.

| Technology                             | Why it is here                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Angular 21 + TypeScript 5.9            | Components, templates, forms, routing, dependency injection and application logic.                                      |
| Ionic 8                                | Mobile-oriented buttons, toolbars, pages, navigation and platform styling.                                              |
| Angular Material/CDK                   | Menus, tooltips, trees, layout utilities and supporting controls.                                                       |
| NGXS 21                                | Shared application state, such as input text, selected languages, pose URL and settings.                                |
| RxJS                                   | React to text changes, state updates, events and asynchronous HTTP responses.                                           |
| Capacitor 8                            | Package the web application for Android/iOS and access supported native features.                                       |
| MediaPipe Holistic                     | Estimate body, face and hand landmarks from an image or video.                                                          |
| TensorFlow.js 4.22                     | Run pretrained recurrent models and image-generation models in JavaScript.                                              |
| Bergamot via `@sign-mt/browsermt`      | Local machine translation using a WebAssembly worker and downloaded models.                                             |
| Sutton SignWriting libraries           | Normalize and render sign symbols.                                                                                      |
| `pose-viewer`                          | Load and display an animated pose sequence.                                                                             |
| Three.js / Google model-viewer         | Vector/plane calculations and 3D character display/animation infrastructure.                                            |
| Firebase                               | External hosting/services, model storage, analytics, performance tracing, App Check and backend cache integration.      |
| Express / Firebase Functions           | Implement API handlers and gateways. Root SSR uses Express 5; the functions package declares Express 4.                 |
| Transloco                              | Translate the application's interface labels into different languages. This is separate from sign-language translation. |
| MediaBunny / WebCodecs / MediaRecorder | Turn rendered frames into playable video, with browser-dependent fallbacks.                                             |
| VitePress                              | Build the separate documentation website.                                                                               |
| Jasmine + Karma / Jest                 | Frontend and backend test infrastructure, respectively.                                                                 |

## 3. Folder-by-folder map

| Folder                | Explain it this way                                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`                | The application users interact with.                                                                                                                                              |
| `src/app/pages/`      | Complete screens: translation, Live Reader, playground, benchmark, settings and landing pages.                                                                                    |
| `src/app/components/` | Reusable pieces: video, speech controls, animation, map, logo and language selector.                                                                                              |
| `src/app/modules/`    | Business logic and state: translation, pose estimation, sign analysis, animation, settings and gesture rules. These are feature folders; not every folder is an Angular NgModule. |
| `src/app/core/`       | Shared infrastructure: model loaders, assets, HTTP token interceptor, internationalization, analytics and video state.                                                            |
| `src/app/directives/` | Reusable element behaviors: drag/drop and native keyboard positioning.                                                                                                            |
| `src/assets/`         | Bundled models, weights, images, icons, fonts, sample videos, locale overrides and promotional material.                                                                          |
| `src/environments/`   | Build-specific Firebase/reCAPTCHA configuration and production flag.                                                                                                              |
| `src/theme/`          | Global Sass, Ionic/Material customization, colors, breakpoints, animations and fonts.                                                                                             |
| `functions/`          | Separate Node/TypeScript server package. It is not automatically running just because `npm start` is running.                                                                     |
| `docs/`               | VitePress research/background documentation, comparison pages and supporting media. These pages include aspirations and external research, not just shipped local features.       |
| `tools/`              | Maintenance, translations, sitemap, build-version and mobile metadata/version scripts.                                                                                            |
| `android/`            | Android Gradle project, manifest, activity, resources, native tests and store metadata.                                                                                           |
| `ios/`                | Xcode project/workspace, app delegate, plist permissions, CocoaPods and store metadata/screenshots.                                                                               |
| `.github/`            | CI workflows, issue template and funding configuration.                                                                                                                           |
| `.husky/`             | Git pre-commit automation.                                                                                                                                                        |
| `node_modules/`       | Installed third-party libraries; generated from dependency manifests/locks. They are dependencies, not your authored project code.                                                |
| `dist/`               | Generated compiled output. Editing it does not update the original source.                                                                                                        |
| `.angular/`           | Angular cache/build artifacts, including the isolated verification build used for this review.                                                                                    |
| `.git/`               | Version history and Git internal data.                                                                                                                                            |

The companion [FILE-REFERENCE.md](FILE-REFERENCE.md) inventories individual project files and directories, including repeated native resources and localized store assets. Binary weights, images and videos are catalogued by role; their internal content is not a line-by-line source review. Third-party and generated directories are identified as such rather than presented as authored functionality.

The snapshot contains **5,017 files in 795 included directories**; **3,961 UTF-8 text files** were read for the searchable index. This includes generated copies embedded under Android/iOS and compiled backend files under `functions/lib`. Those copies can differ from current source; they are not thousands of separate application features. The original source is the basis for the technical explanations.

### How Angular component files relate

For most screens, `name.component.ts` controls behavior, `name.component.html` defines visible structure and bindings, `name.component.scss` defines presentation, and `name.component.spec.ts` contains tests. A CSS change can alter layout without changing recognition. A template can advertise a feature whose underlying TypeScript is incomplete, so always trace the handler/service too.

## 4. Startup and navigation

1. The browser loads `src/index.html` and the JavaScript built from `src/main.ts`.
2. `main.ts` enables production mode when appropriate, initializes web Firebase, and bootstraps the standalone `AppComponent` with zone-based change detection.
3. `app.config.ts` installs the router, Ionic, animations, HTTP, token interceptor, Transloco, global `SettingsState`, hydration/event replay and production service worker.
4. `AppComponent` manages interface language, document direction, navigation analytics, cookie consent, theme color, embedded mode and native keyboard/splash behavior.
5. `app.routes.ts` selects a page. Heavy pages are lazy-loaded, which postpones loading them until navigation requires them.

| URL                                     | Purpose                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/`                                     | Main translator; route-level providers register `TranslateState` and MediaPipe language detection. |
| `/translate`                            | Redirect to the main translator.                                                                   |
| `/live-sign-reader`                     | Independent live camera letter reader.                                                             |
| `/playground`                           | Camera/sample-video analysis and experimental feature toggles.                                     |
| `/benchmark`                            | Timing experiments for pose, language detection and Pix2Pix.                                       |
| `/settings/offline`                     | Download/delete model and character assets.                                                        |
| `/settings/appearance`                  | Appearance selection.                                                                              |
| `/settings/input`, `/settings/output`   | Voice settings pages whose templates explicitly say language selection is not yet implemented.     |
| `/settings/about`, `/settings/feedback` | App information, legal links and feedback choices.                                                 |
| `/about`, `/about/contribute`           | Informational pages.                                                                               |
| `/legal/terms`, `/legal/privacy`        | Legal content pages.                                                                               |

`LicensesComponent` exists, but `landing.routes.ts` currently does not register a `licenses` child route. References to `/legal/licenses` do not prove that page is reachable.

Optional URL parameters include `text`, `spl` (spoken-language code), `sil` (signed-language code), `lang` (interface language), and `embed`.

## 5. Exactly what happens when you type a sentence

Example: type “Hello” with English and ASL selected.

1. `SpokenLanguageInputComponent` stores user input in a reactive `FormControl`.
2. RxJS waits about **300 ms** after typing stops and ignores repeated equivalent trimmed text before dispatching `SetSpokenLanguageText`. A separate approximately **1 second** debounce requests an optional normalization suggestion.
3. `TranslateState.setSpokenLanguageText()` stores the text, starts language detection and segments the trimmed input into sentences using `Intl.Segmenter` where available.
4. The state dispatches `ChangeTranslation`. Its NGXS handler is marked `cancelUncompleted: true`, so newer translation work can replace the previous observable action.
5. The handler sets `signedLanguagePose` to the URL returned by `TranslationService.translateSpokenToSigned()`.
6. That URL targets `https://us-central1-sign-mt.cloudfunctions.net/spoken_text_to_signed_pose`, with `text`, `spoken` and `signed` query parameters.
7. At the same time, the state calls `SignWritingTranslationService.translateSpokenToSignWriting()` for the symbols.
8. `SignedLanguageOutputComponent` observes the pose and viewer setting and selects a skeleton, person or avatar viewer.
9. The SignWriting result is split into signs, normalized after fonts load, stored in state, and rendered by `SignWritingComponent`.

**Critical distinction:** the frontend launches a pose request and a SignWriting request separately. Although the research documentation describes a text → SignWriting → pose pipeline, the local UI does not take its freshly returned SignWriting text and feed it into a local pose generator. Do not invent that connection during your explanation.

The optional normalization suggestion is also not automatically required for every translation. The backend can correct spelling and expand numbers using a configured language model; the UI offers the result as alternative text. Only applying the suggestion makes that text the next translation input.

## 6. What actually makes the signs move?

There are three different representations to remember:

- **Spoken text:** ordinary words such as “Hello”.
- **SignWriting:** symbolic text describing sign features and arrangement. Formal SignWriting strings can look like `M507x523S15a28494x496`.
- **Pose sequence:** positions of body/hand/face points across time, with frames and a frame rate. This supplies movement for the skeleton renderer.

### Default skeleton path

`SkeletonPoseViewerComponent` displays a `<pose-viewer>` element with a pose source. The element loads and renders the sequence. The application listens for `firstRender$`, `render$` and `ended$`.

On supported browsers it collects rendered frames and uses `PlayableVideoEncoder`:

1. Read pose FPS.
2. Ensure frame dimensions are even for AVC/H.264.
3. Create MediaBunny's video sample source and MP4 output.
4. Assign frame timestamps as `frameIndex / fps` and duration as `1 / fps`.
5. Add frames and finalize to a video Blob.
6. Create an object URL and dispatch `SetSignedLanguageVideo`.
7. The output component switches to a looping HTML video. Download/share controls become available.

When WebCodecs video encoding is unavailable, a canvas stream and `MediaRecorder` provide a fallback. These capabilities differ by browser. The source already includes comments about imperfect fallback recording and iOS behavior.

**Say:** “The model/service decides the pose sequence. The viewer draws that sequence. Encoding turns those drawings into a reusable video.”

### Human-style output

`HumanPoseViewerComponent` takes the pose-rendered canvas and sends frames through `Pix2PixService`. Two remote model directories provide a generator and an upscaler. `pix2pix.model.ts` normalizes pixels to approximately `[-1, 1]`, runs the generator, returns output to `[0, 1]`, upscales it, and removes green-screen pixels by making them transparent. A worker plus Comlink keeps most work outside the main UI thread; Safari uses an in-thread fallback.

This is an inference implementation, not a training pipeline. No local training dataset or accuracy evaluation for this feature is supplied.

### Avatar infrastructure

`AnimationService` normalizes **75 landmarks** (33 body + 21 left hand + 21 right hand) into **225 coordinates**. Its pretrained model outputs **208 numbers**, interpreted as **52 bone quaternions**, four values per rotation. `AnimationComponent` turns those into Three.js quaternion keyframe tracks and loads an external GLB character, plus USDZ on iOS.

The playground can request pose-driven animation through `AnimationState`. The text-to-pose `AvatarPoseViewerComponent`, however, only reads the pose FPS and explicitly leaves passing pose tensors into animation as a TODO. The existence of a 3D character does not prove complete signing retargeting in the translator.

## 7. Speech input and output

`SpeechToTextComponent` uses `SpeechRecognition` or `webkitSpeechRecognition`, depending on browser support. It requests interim results but sets `continuous = false`. It emits recognized text through `changeText`; the translator treats that like typed text. The code handles missing support and certain permission/service errors.

`TextToSpeechComponent` uses `SpeechSynthesisUtterance`. It tries to select a local voice for the chosen language, then any matching voice. The Live Reader has a separate speech method with `en-US` and rate `0.9`.

The application does not include its own speech recognition acoustic model or speech synthesis engine. Browser recognition may use a provider's network service; do not promise all voice functionality works offline.

## 8. Live Sign Reader: step-by-step

The two key files are:

- `src/app/pages/live-sign-reader/live-sign-reader.component.ts`: camera, loop, display, text assembly and controls.
- `src/app/modules/hand-gesture/hand-gesture-recognition.service.ts`: geometry and letter decisions.

### Camera and landmark detection

After the view initializes, the page requests a front-facing camera with ideal resolution **1280 × 720**, with audio disabled. It loads MediaPipe Holistic through `MediapipeHolisticService`, locating runtime files under `assets/models/holistic/`.

The Live Reader uses model complexity `0`, built-in landmark smoothing, minimum detection confidence `0.6` and tracking confidence `0.5`. It requests `upperBodyOnly: true`; treat this as a requested option rather than a guarantee of a particular model version's internal behavior.

A `requestAnimationFrame` loop sends frames to Holistic. Each awaited `send()` prevents this loop from intentionally stacking simultaneous frame requests. When results arrive, it draws a mirrored image and hand connections on a canvas and passes landmarks to the classifier.

### What the 21 hand points mean

| Indices | Meaning                        |
| ------- | ------------------------------ |
| `0`     | Wrist                          |
| `1–4`   | Thumb joints through tip       |
| `5–8`   | Index finger base through tip  |
| `9–12`  | Middle finger base through tip |
| `13–16` | Ring finger base through tip   |
| `17–20` | Little finger base through tip |

The app represents each point as `{x, y, z}`. These are model-estimated coordinates, not measured physical distances in centimetres. In image coordinates, smaller y generally means higher on screen, which is why some rules test `tip.y < joint.y`.

MediaPipe is the pretrained computer-vision part. The following letter decisions are hand-written logic, not a separate trained ASL classifier.

### Smoothing

For each coordinate:

```text
smoothed = 0.6 × previousSmoothed + 0.4 × currentObserved
```

This exponential moving average reduces jitter but adds response delay. There is also MediaPipe's own smoothing. The service resets its smoothing when no hands are detected. It has one shared previous-landmark array; switching between left and right hands can mix their histories until the values settle.

### Normalization

```text
referenceLength = distance(wrist[0], middleFingerBase[9])
normalizedPoint = (point - wrist) / referenceLength
```

Subtracting the wrist removes translation across the image. Dividing by a palm reference reduces scale variation when the hand moves closer or farther away. If that reference distance is zero, the code falls back to `1`.

**It does not normalize rotation.** Many rules still require fingers to point upward in the image.

### Extracted features

- Distance between points in x/y/z.
- A 2D angle at a joint, computed with `atan2(abs(cross), dot)`.
- Whether finger tips lie above intermediate joints and sufficiently far from the wrist.
- Whether fingers are folded below their base joints.
- Thumb position inside/outside the palm, with left/right x comparisons.
- Thumb-to-tip distances and index-to-middle distance.

### Examples of rules

| Output  | Rule idea in this implementation                                                                |
| ------- | ----------------------------------------------------------------------------------------------- |
| Space   | All fingers and thumb extended with a sufficiently wide spread. This is an app control gesture. |
| A       | Fingers folded, thumb outside and above index base.                                             |
| B       | Four fingers extended, thumb inside.                                                            |
| D       | Index extended, other fingers not extended, thumb near middle tip.                              |
| F       | Thumb near index tip and other three fingers extended.                                          |
| I       | Little finger extended, other fingers and thumb not extended.                                   |
| Y       | Thumb and little finger extended, other fingers not extended.                                   |
| L       | Index and thumb extended, other fingers folded, adequate separation.                            |
| V       | Index/middle extended and separated by more than `0.3` normalized units.                        |
| U       | Index/middle extended and separated by at most `0.3`.                                           |
| W       | Index, middle and ring extended; little finger not extended.                                    |
| Unknown | No matching rule returns `?` with confidence `0.3`.                                             |

These describe code conditions, not an authoritative ASL teaching chart. The repository also contains rules intended for other letters; overlapping rule order limits actual coverage.

The classifier prefers the right hand if both hands are present; otherwise it uses the left. It does not combine two-handed signs. The `both` type exists in the interface but is not returned by the implementation.

### Confidence and text assembly

Each rule returns a fixed confidence, for example `0.9` for L or `0.85` for D. The displayed “90%” is therefore a rule-assigned value, not a measured probability and not an accuracy result.

The component accepts a result when a hand is visible, the letter is neither empty nor `?`, and confidence is **strictly greater than `0.65`**. It normally waits **800 ms since the last accepted letter**, or **1500 ms when the detected letter matches the last accepted letter**.

**Actual timing limitation:** it does not track how long the current candidate has remained stable. The first result may be accepted immediately because `lastLetterTime` starts at zero. Calling this a strict “hold the same sign for 800 ms” algorithm would be inaccurate.

Letters append to `currentWord`. A space gesture or Space button moves that word into `builtSentence`. `fullText` joins the two. The page keeps up to 50 recognized entries and 20 recent-letter strings; the displayed feed shows up to 15 entries. Copy uses the Clipboard API. Speak uses browser speech synthesis. On destruction it cancels animation, stops camera tracks, closes Holistic and cancels speech.

### Concrete recognition gaps to know

1. **J has no classification rule.** The A–Z reference grid does not establish A–Z support.
2. **Z is a static approximation with confidence `0.6`.** The component's `> 0.65` condition prevents that result from entering the built text.
3. **R and K are shadowed by V/U.** For the same index-and-middle-extended configuration, V handles distances `> 0.3` and U handles `<= 0.3`, so the later R/K branches cannot be reached for ordinary finite coordinates.
4. **Motion is not modeled.** Dynamic letters and continuous signs need temporal trajectory processing.
5. **Viewpoint matters.** Image-y comparisons are sensitive to hand rotation and occlusion.
6. **Rule scores are fixed.** No held-out dataset, confusion matrix or demonstrated accuracy is included.

## 9. The original reverse-translation screen

`src/app/pages/translate/signed-to-spoken/signed-to-spoken.component.ts` defines `FAKE_WORDS`, a sequence of timestamps, SignWriting strings and text fragments ending in “What is your name?”.

Its animation loop checks `video.currentTime` and chooses the latest matching sample. It updates text and symbols from that table. It does not use an arbitrary uploaded sign video's content to predict the sentence.

The camera/video/pose analysis around this screen is real infrastructure, but the displayed sentence is demonstration data. `TranslateState` also has no completed general signed-to-spoken branch in `changeTranslation()`: it returns `EMPTY` outside the spoken-to-signed branch. The `StoreFramePose` handler computes a normalized pose but leaves its state update commented out.

**Say:** “The main reverse screen demonstrates the intended interface. The Live Reader implements limited letter recognition separately. Full continuous video-to-sentence translation remains future work.”

## 10. Other pretrained model modules

These architectures were inspected from local `model.json` files. The `.bin` files contain their numerical weights. Do not confuse them with the Live Reader's letter rules.

| Model                       | Input and architecture in this repository                                                                                               | Output/use                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hand-shape`                | `[1, 1, 63]`: 21 points × 3 coordinates; three stateful SimpleRNN layers with 64 units, layer normalization and 261-output Dense layer. | Estimate a SignWriting handshape category. `HandsService` uses separate stateful instances for left and right. It does not directly return English letters. |
| `face-features`             | `[1, 1, 1404]`: 468 face points × 3; batch normalization, two stateful 128-unit SimpleRNN layers and classification heads.              | Four eye categories, three eyebrow categories and seven mouth categories, mapped to SignWriting symbols.                                                    |
| `sign-detector`             | 25 motion features, dropout, a stateful 64-unit LSTM and a 2-output Dense layer.                                                        | Estimate signing activity, not which sign or sentence is being produced.                                                                                    |
| `pose-animation`            | `[1, 1, 225]`, Dense 208, two stateful 208-unit SimpleRNN layers, layer normalization and Dense 208.                                    | 52 quaternion rotation tracks for a 3D skeleton.                                                                                                            |
| MediaPipe language detector | Bundled `model.tflite` plus WASM runtime copied from the package.                                                                       | Identify the spoken language of text. Unrelated to camera sign recognition.                                                                                 |
| MediaPipe Holistic          | Runtime/model assets copied from installed dependency at build time.                                                                    | Body, face and both hands' landmarks.                                                                                                                       |
| Bergamot                    | Translation model, vocabulary and auxiliary files loaded from asset storage/cache.                                                      | Text to SignWriting in the current frontend use.                                                                                                            |
| Pix2Pix generator/upscaler  | Downloaded from external storage; not supplied as local training code.                                                                  | Pose drawing to human-style frames.                                                                                                                         |

### Playground pipeline

`VideoModule` registers `VideoState`, `PoseState`, `SignWritingState` and `DetectorState`. `AnimationModule` registers `AnimationState`. `VideoComponent` loads a camera or video source, predicts pose for changed frames, and draws layers according to settings.

Holistic can provide 33 body + 468 face + 21 left-hand + 21 right-hand points = **543 landmarks** in the representation used here. Missing sets can be filled with zero landmarks. `PoseService.normalizeHolistic()` scales to image dimensions and can center/scale by shoulder geometry.

`PoseNormalizationService` performs extra plane alignment, rotation, scaling and mirroring for model inputs. `HandsService` estimates hand plane, rotation bucket, palm-facing direction and shape; `FaceService` maps neural model outputs to facial symbols; `BodyService` draws shoulder and arm information.

`DetectorService` normalizes motion using a 20-frame shoulder-width window, converts to a 25-point OpenPose-like representation and estimates signing activity. Its README explicitly warns that its training representation differs from MediaPipe. The source also assigns `rightHandLandmarks` from `pose.leftHandLandmarks`; this is a concrete defect to correct during future development. The final 25-point representation is primarily body points, so do not overstate the effect of that typo on this detector's output.

## 11. Offline translation and storage

`SettingsOfflineComponent` lists character files, Pix2Pix directories and two translation directories, including the multilingual `spoken-signed` model. Downloading a model is a preparation step that requires access to the asset service.

`AssetsService`:

1. Checks metadata/directory records in `localStorage`.
2. Uses browser-origin file storage through `navigator.storage.getDirectory()` when supported.
3. Falls back to Capacitor Filesystem storage.
4. Falls back to a remote URL when local file access is unavailable.
5. Tracks download progress, file size and update metadata.

The large binary models are not stored as ordinary `localStorage` strings. `localStorage` mainly records directory lists and metadata. Browser storage may be cleared or evicted; persistence is not guaranteed by this implementation.

`SignWritingTranslationService` tries a language-specific offline model, then a multilingual offline model, then the online SignWriting API on errors. The generic input includes language tags. Bergamot runs in a worker using WebAssembly; the frontend builds a model registry and calls `worker.translate()`.

**Current defect:** after the offline fallback, the RxJS chain applies `filter(() => navigator.onLine)` when a navigator exists. A successful local result is therefore filtered out when the browser reports offline. A filtered emission is not an error, so it does not trigger the online fallback. This contradicts a blanket “fully offline translation works” claim.

Even after correcting that filter, the main translator still generates a remote pose API URL. Local SignWriting availability alone is not local sign-animation generation.

The production service worker separately caches the app shell and lazily requested assets. Caching the UI does not make every remote API available offline.

## 12. Backend, APIs and data

`functions/` is a separate package with its own `package.json`, TypeScript configuration and Jest configuration. `functions/src/index.ts` initializes Firebase Admin and exports gateway, prerender, text translation and normalization functions.

### Translation cache

`TextToTextTranslationEndpoint` validates direction/from/to/text, looks for a cached translation under:

```text
translations/{direction}/{from}-{to}/{md5(text)}
```

On a miss, it loads a specific or generic Bergamot model from the assets bucket, runs translation and writes the input, translation, counter and timestamp. On a hit, it increments the counter and timestamp. MD5 is being used as a cache key; it does not encrypt the stored text. The cache stores the text alongside the result.

### Normalization cache

`TextNormalizationEndpoint` checks:

```text
normalizations/{language}/{md5(text)}
```

Its model module requests a configured OpenAI model named `gpt-4o-mini` with few-shot examples and temperature `0`. This is used to normalize spelling, capitalization, numbers and units. It is not the hand detector and not the pose renderer. Cache entries store input, output, counter and timestamp, and normalized outputs are mapped to themselves.

### Gateway and protection

- Gateway routes expose `/api/v1/...` and short equivalents for pose/video and avatar operations.
- Unkey middleware verifies API keys. Other middleware rate-limits normalization requests using a hashed, salted client-IP identifier.
- App Check middleware verifies an app-attestation token. The frontend interceptor attempts to attach `X-Firebase-AppCheck` and `X-AppCheck-Token` for matching Angular HTTP requests.
- The interceptor includes a development local-storage token override. This review did not copy tokens or access the production service. Use your own authorized Firebase/debug setup for demonstrations.
- Note that requests made internally by custom elements or raw `fetch()` are not automatically Angular `HttpClient` requests; the Angular interceptor's existence alone does not guarantee all network calls receive its headers.
- `firebase.json` maps hosting URLs to functions. Some mapped functions, including `spoken_text_to_signwriting`, `signwriting_description` and the pose-generation service, are external to the implementation contained in `functions/src`.
- `avatars.ts` lists/deletes avatar assets in Cloud Storage and forwards creation to another external service. It is not a local custom-avatar training system.

There is no full user-account or student-record database implemented in this frontend. Do not say Firestore stores your recognized letters: letters are component state, and the implemented backend caches shown here use Realtime Database.

## 13. Mobile, PWA and wristband explanation

The main translator uses a media query at **599 px** to choose the mobile layout. Desktop can also preview the mobile interface inside an iPhone-style frame.

Smartband View is HTML/CSS around `SignedLanguageOutputComponent`. It uses the browser's microphone, dispatches recognized English text to the same store and displays the same output in a small wearable-shaped screen. Its displayed time is hardcoded. No Bluetooth, Web Serial, sensor acquisition, ESP32/Arduino source or wristband firmware was found in the project code.

`capacitor.config.ts` sets app ID `mt.sign.translate`, app name `sign` and web directory `dist/sign-translate/browser`. Optional environment settings allow a development server URL. The config still carries upstream names.

Android's `MainActivity` is a standard Capacitor `BridgeActivity`; the app's sign logic remains in the web code. Android resources/manifest configure icons, launch behavior, theme and permissions. The iOS app delegate and Xcode/CocoaPods files provide the corresponding shell and native plugin setup. Native compilation was not performed during this review.

`PwaInstallService` captures a browser install prompt. The manifest and production Angular service worker allow supported browsers to install/cache the app. This does not prove the project is currently published to any particular live URL or store.

## 14. Configuration and maintenance files

| File/group                                                   | Purpose                                                                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                               | Frontend dependencies, scripts and package version (`0.0.4`).                                                                                                 |
| `package-lock.json`                                          | Exact dependency-resolution lock for npm.                                                                                                                     |
| `angular.json`                                               | Build/test/serve settings; copies MediaPipe, TFJS WASM, fonts, flags, locales and Bergamot worker assets.                                                     |
| `tsconfig*.json`                                             | TypeScript rules for application, tests and workers.                                                                                                          |
| `karma.conf.js`                                              | Frontend browser-test runner and coverage settings.                                                                                                           |
| `firebase.json`, `.firebaserc`                               | Hosting headers/rewrites, function source, emulator ports and project/target mapping.                                                                         |
| `ngsw-config.json`                                           | PWA app-shell and asset cache rules.                                                                                                                          |
| `capacitor.config.ts`, `env.ts`, `ionic.config.json`         | Native wrapper, validated development-server environment settings and Ionic project metadata.                                                                 |
| `.eslintrc.json`, `.prettierrc.json`, `.editorconfig`        | Code style and formatting conventions.                                                                                                                        |
| `.gitignore`, `.prettierignore`, `.browserslistrc`, `.npmrc` | Repository, formatter, browser and package-manager settings.                                                                                                  |
| `README.md`, `DEPLOYMENT.md`, `CHANGELOG.md`, `ISSUES.md`    | Setup, deployment guidance, change history and known issues. Validate instructions against the actual code before relying on them.                            |
| `LICENSE.md`, `PRIVACY.md`                                   | Local terms/license statements and privacy copy; these are project documents, not proof of model provenance or implemented technical behavior.                |
| `rename.js`                                                  | Broad rebranding script. It reads and rewrites files recursively; it is maintenance code, not part of runtime recognition. Do not run it as part of the demo. |
| `update.sh`, `update-dependencies.sh`                        | Upgrade/sync automation. Some comments and shell assumptions are inherited/outdated; they are not needed to explain the running app.                          |

`tools/generate-build-version.js` creates an i18n cache-busting version. `sitemap-generator.js` writes website search-engine files. `firebase-http-push.js` edits hosting preload headers. i18n scripts update locale files. `tools/mobile/` synchronizes app metadata/version numbers, prepares store text/screenshots and defines device/locale mappings. Those tools do not perform sign recognition.

The Android Fastlane file includes inherited release lanes referencing flavors/helpers not configured by the simple app Gradle file. Treat native release automation as unverified scaffolding, not a proven deployment process.

## 15. Tests, limitations and what was checked

There are **76 frontend `*.spec.ts` files** and **7 backend files matching `*spec.ts`** in the examined source tree. This is a file count, not a count of passed tests. Many UI tests check component creation or accessibility; model/unit tests exercise selected behavior. No Live Reader/classifier spec files are present in its new folders.

Do not report an accuracy percentage, latency guarantee, complete automated-test pass, successful native build, or production-service availability without performing the corresponding evaluation.

### Review verification results

- Local runtime observed: Node `v24.13.0`, npm `11.6.2`.
- `npx tsc --noEmit -p tsconfig.app.json`: **passed**. This checks TypeScript; it does not fully validate Angular templates or model output quality.
- `npx ng build --configuration=development --ssr=false --prerender=false --source-map=false --output-path=.angular/review-build`: **passed**, producing the browser app in `.angular/review-build` with zero prerendered routes. It reported unused imports in the announcement/about components and an unmatched Stencil dependency glob. Initial development chunks totaled about **4.43 MB**; that is a development bundle size, not a production performance result.
- No live camera/microphone inference, production translation requests, backend integration tests or native Android/iOS builds were performed as part of the source review.
- Existing application edits were preserved. The review adds documentation; it does not change the implementation or silently fix its limitations.

### Source checkpoints for important conclusions

| Conclusion                     | Source location                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Hardcoded reverse translation  | `src/app/pages/translate/signed-to-spoken/signed-to-spoken.component.ts:22` (`FAKE_WORDS`) and `:134` (time lookup). |
| Remote pose generation         | `src/app/modules/translate/translate.service.ts:206`.                                                                |
| Main translation orchestration | `src/app/modules/translate/translate.state.ts:296`.                                                                  |
| Letter geometry                | `src/app/modules/hand-gesture/hand-gesture-recognition.service.ts:72`.                                               |
| Wrist/scale normalization      | Same gesture service, `:38`.                                                                                         |
| Smoothing                      | Same gesture service, `:49`.                                                                                         |
| Letter acceptance/timing       | `src/app/pages/live-sign-reader/live-sign-reader.component.ts:216`.                                                  |
| Offline result suppression     | `src/app/modules/translate/signwriting-translation.service.ts:131`.                                                  |
| Unfinished avatar connection   | `src/app/pages/translate/pose-viewers/avatar-pose-viewer/avatar-pose-viewer.component.ts:28`.                        |
| Single-session voice input     | `src/app/components/speech-to-text/speech-to-text.component.ts:41`.                                                  |

### Main development gaps, in priority order

1. Correct the original reverse screen's sample-data labeling and implement a real model before presenting general video-to-sentence translation.
2. Fix Live Reader rule shadowing, unsupported dynamic letters, shared smoothing history and candidate-stability timing. Replace fixed confidence labels with a clear rule score or a validated probability.
3. Fix the offline-result filter and provide a genuinely local pose-generation route before claiming end-to-end offline signing.
4. Complete translator pose-to-avatar connections and verify the required state providers.
5. Evaluate camera behavior across signers, handedness, illumination, distance and viewpoints. Record a confusion matrix and accepted-letter errors.
6. Improve lifecycle/error handling: the original reverse screen's animation loop has no cancellation; the Live Reader can continue initialization after camera failure and may hide model-error text when the loading overlay closes.
7. Verify server rendering and production hosting independently. `app.config.server.ts` leaves server-rendering providers commented out, and several browser APIs need server guards. The browser-only check does not validate SSR.
8. Finish placeholder settings, register intended routes, reconcile upstream branding and document exact contribution boundaries.

## 16. Viva questions and answers

**What problem are you solving?**
We are exploring tools that make spoken and signed communication more accessible through visual sign output and a limited camera-based letter reader.

**Why are there two recognition/translation flows?**
Generating signed output from text is a language-generation problem. Reading a camera gesture starts with computer vision and classification. They share interface infrastructure but use different algorithms.

**What is NGXS? Why use it?**
It holds shared state in one place. An action such as changing text updates state and triggers translation; output components subscribe to the resulting pose, symbols and video without directly calling every other component.

**What are an action, state and service?**
An action expresses an event, such as `SetSpokenLanguageText`. A state stores current values and handles actions. A service performs reusable work such as an API request, landmark preprocessing or model inference.

**What is the difference between pose detection and sign recognition?**
Pose detection locates body/hand points. Sign recognition interprets those points over space and time. Detecting a hand alone does not identify a letter or understand a sentence.

**Is the Live Reader AI?**
It uses pretrained MediaPipe vision inference to estimate points. The current letter classification layer is rule based. Other modules use pretrained neural models, but that does not turn the letter rules into a trained classifier.

**Which machine-learning algorithm did you train?**
Training scripts for these models are not present in this repository. Explain the pretrained models you integrated and the parts you actually implemented. Do not describe the repository's inference code as evidence that you trained the models yourself.

**Why 21 landmarks?**
The hand representation includes the wrist and four points for each of five fingers, giving 21 numbered locations.

**What do x, y and z mean?**
They describe estimated position and relative depth in the model's coordinate representation. The application uses them for relative geometry, not calibrated physical measurements.

**How do you distinguish L from I or V?**
L uses index/thumb extension with the other fingers folded. I uses the little finger alone. V uses index and middle extended with sufficient separation. The service tests these feature combinations in order.

**Can it recognize every ASL letter?**
No. J has no rule, Z's score fails the append threshold, and later R/K rules are shadowed. The alphabet grid is a reference UI, not proof of classification coverage.

**Can it understand sentences from gestures?**
The Live Reader assembles classified letters into words; it does not understand continuous sign-language sentences. The original reverse page uses timed sample data.

**What is your accuracy?**
No reliable measured accuracy is included. The displayed rule scores are fixed constants. Accuracy would require labeled samples, a separate evaluation set and metrics across users and conditions.

**How would you measure it?**
Collect consented labeled sequences from multiple signers. Keep evaluation signers separate from training signers. Measure per-letter precision/recall, confusion matrix, unknown detection, false additions and recognition latency. For text output also measure character/word errors. Report conditions and sample counts.

**How does it handle repeated letters?**
The component allows the same accepted letter again after 1500 ms. It does not currently require releasing the hand or detecting a repeated-letter motion.

**Why does it sometimes type extra letters?**
The timing is based on time since the last addition rather than continuous stability of the current candidate, and hand rules overlap. Landmark jitter, angle and occlusion also affect features.

**What makes the animation?**
A remote service supplies a time-varying pose sequence. The skeleton viewer renders its frames; the application can encode those frames into video. The local repository does not contain the main remote text-to-pose model's implementation.

**What is the role of a neural network here?**
Different pretrained networks perform different tasks: landmark estimation, handshape categories, facial features, signing activity, avatar rotations, text translation and frame generation. They are not one universal network.

**What is the difference between SignWriting and gloss?**
In the project's documentation, glosses label signs using words, while SignWriting represents visual sign features symbolically. The documentation discusses both pipelines; the current frontend requests SignWriting and pose output through their respective services.

**Where is the database used?**
Server functions cache translations and normalizations in Firebase Realtime Database to reuse repeated results. Models and avatars are stored in Cloud Storage. The current Live Reader keeps its text in memory.

**Does it work without the internet?**
Some assets and SignWriting models can be downloaded and run locally. Complete offline text-to-sign video is not established, and the current SignWriting result filter must be corrected for reliable offline display. Speech recognition can also depend on the browser's service.

**Why use WebAssembly and a worker?**
WebAssembly allows the Bergamot runtime to execute in the browser. A worker performs translation outside the main UI thread so lengthy processing is less likely to block interaction.

**Is the wristband physically connected?**
No hardware integration is implemented in this checkout. Smartband View is a frontend preview sharing the app's speech-to-sign output. Hardware would require sensors, firmware, a communication protocol and device testing.

**Why Angular, Ionic and Capacitor?**
Angular organizes application logic; Ionic provides mobile-friendly UI; Capacitor packages the same web code with native plugins. This supports reuse, but platform builds and device behavior still need independent verification.

**What would you do next?**
Stabilize the current letter reader and evaluate it, add temporal models for motion and word/sign sequences, complete the actual reverse translation pipeline, improve local inference and only then integrate a physical wearable.

## 17. A good closing statement

“This prototype demonstrates the application architecture for accessible text/speech-to-sign output and camera-based fingerspelling. It integrates existing research models with a cross-platform interface. The main learning is how to separate vision, language translation and rendering. The next stage is validated temporal recognition, complete reverse translation and device integration.”
