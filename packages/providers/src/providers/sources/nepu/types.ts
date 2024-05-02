export interface SearchResults {
  data: {
    id: number;
    name: string;
    url: string;
    type: 'Movie' | 'Serie';
  }[];
}
