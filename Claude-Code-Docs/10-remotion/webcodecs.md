# @remotion/webcodecs

> Source: https://www.remotion.dev/docs/webcodecs
> Available from v4.0.229

> **Warning:** WebCodecs is being phased out in favor of Mediabunny.
> **Unstable API** - API may change at any time.

APIs for converting videos in the browser using `@remotion/media-parser` and the native WebCodecs API.

## Capabilities

- **Convert formats**: `.mp4`, `.webm`, `.mov`, `.mkv`, `.m3u8`, `.ts`, `.avi`, `.mp3`, `.flac`, `.wav`, `.m4a`, `.aac` → `.mp4`, `.webm`, `.wav`
- **Rotate videos** - Fix bad orientation
- **Extract frames** - Efficiently get specific frames from a video
- **Extract audio** from a video
- **Manipulate pixels** - Process video frame data
- **Fix MediaRecorder videos** - Fix missing duration and seeking issues
- **Coming soon**: Compress, trim, crop videos

## Performance

Unlike WebAssembly solutions, WebCodecs has full GPU acceleration - vastly faster than online converters or WASM-based processing.

## License

- Individuals and teams up to 3: Free
- Companies (4+ people): Requires Remotion Company license + WebCodecs Conversion Seat

## Installation

```bash
npx remotion add @remotion/webcodecs
# or
npm i --save-exact @remotion/webcodecs@4.0.438
```

## APIs

| API | Description |
|-----|-------------|
| `convertMedia()` | Converts a video using WebCodecs and Media Parser |
| `getAvailableContainers()` | List supported containers |
| `webcodecsController()` | Pause, resume, and abort conversion |
| `canReencodeVideoTrack()` | Check if video track can be re-encoded |
| `canReencodeAudioTrack()` | Check if audio track can be re-encoded |
| `canCopyVideoTrack()` | Check if video can be copied without re-encoding |
| `getDefaultAudioCodec()` | Get default audio codec for a container |
| `getDefaultVideoCodec()` | Get default video codec for a container |
| `extractFrames()` | Extract frames at specific timestamps |
| `convertAudioData()` | Change format or sample rate of AudioData |
| `createAudioDecoder()` | Create an AudioDecoder |
| `createVideoDecoder()` | Create a VideoDecoder |
| `rotateAndResizeVideoFrame()` | Rotate and resize a video frame |

## Writers

- `webFsWriter` - Save to browser file system (File System Access API)
- `bufferWriter` - Save to in-memory resizable ArrayBuffer

## Guide Topics

- Convert a video from one format to another
- Rotate a video
- Track transformation (copy, re-encode, drop)
- Pause, resume, and abort conversion
- Fix a MediaRecorder video
- Resample audio to 16kHz for Whisper

## Related

- [Media Parser](./media-parser.md)
- [Rendering](./rendering.md)
- [Using Audio](./using-audio.md)
