import styles from "./page.module.scss";
import MarsMap from "@/components/MarsMap";
import Stars from "./assets/stars.png";
import Twinkling from "./assets/twinkling.png";
import DriveRover from "../feature/DriveRover";

export default async function Home() {
   return (
       <main className={styles.main}>
           <div className={styles.stars} style={{background: `#04050f url(${Stars.src}) repeat top center`}}></div>
           <div className={styles.twinkling} style={{background: `transparent url(${Twinkling.src}) repeat top center`}}></div>
           <DriveRover/>
       </main>
   );
}
