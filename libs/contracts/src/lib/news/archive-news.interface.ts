export interface ArchiveNewsResultInterface {
  news: ArchiveNewsInterface[];
  resultsCount: number;
}

export interface ArchiveNewsInterface {
  authorId: number;
  authorName: string;
  datetimezone: string;
  header: string;
  headerEn: string;
  id: number;
}
