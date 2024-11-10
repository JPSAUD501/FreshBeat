import { Video } from '../dto/video.dto.ts'
import { YouTubeTrackInfoRequest } from './track.dto.ts'
import * as YouTube from 'scrape-youtube'

export class Track {
  async getTrackInfo(props: YouTubeTrackInfoRequest): Promise<Video[]> {
    const result = await YouTube.search(`${props.track} ${props.artist}`)
    return result.videos.slice(0, props.limit).map((video) => ({ ...video, musicLink: `https://music.youtube.com/watch?v=${video.id}` }))
  }
}
