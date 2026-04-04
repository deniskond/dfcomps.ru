export interface DemoRecordSection {
  demoname: string;
  /** Raw console line: `print "Date: MM-dd-yy HH:mm\n"` */
  date?: string;
  /** Raw console time line when there is exactly one match */
  time?: string;
  /** Finish time formatted as `mm.ss.ms`, suffixed with ` (Time reset)` for TR runs */
  bestTime?: string;
  maxSpeed?: string;
  /** Present with value `"true"` when the file-start client differs from the timer-start player */
  spectatorRecorded?: string;
  /** `"<N> sec (ServerTime: mm.ss.ms)"` when timer start is >20 s after file start */
  lateStart?: string;
  /** Catches dynamic `"time 1"`, `"time 2"` … keys when multiple console time lines are found */
  [key: string]: string | undefined;
}
