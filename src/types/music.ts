export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  coverImage: string;
  genre?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  coverImage?: string;
}

export interface MusicPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  playlist: Track[];
  currentTrackIndex: number;
  isExpanded: boolean;
  isTrackLoading: boolean;
}

export interface MusicPlayerActions {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setTrack: (track: Track) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleExpanded: () => void;
}
