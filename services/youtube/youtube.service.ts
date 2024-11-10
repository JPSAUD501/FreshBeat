import { Track } from './track/track.service.ts'

export class YouTubeService {
  readonly track: Track

  constructor() {
    this.track = new Track()
  }
}
