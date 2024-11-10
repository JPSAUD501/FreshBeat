import * as YouTube from 'scrape-youtube'

export interface Video extends YouTube.Video {
  musicLink: string
}
