'use client'
import MarsMap from "@/components/MarsMap";
import {useEffect, useState} from "react";
import Rover from "@/components/Rover";
import {useKeyDown} from "@/hooks/useKeyDown";
import {useRoverServer} from "@/hooks/useRoverServer";
import styles from './DriveRover.module.scss'
const MOVING_DURATION = 500;

export default function DriveRover() {
    const [center, setCenter] = useState<[number, number] | null>(null)
    const [mapReady, setMapReady] = useState(false)
    const [isMoving, setIsMoving] = useState(false)
    const [isBlocked, setIsBlocked] = useState(false)
    const [roverRotation, setRoverRotation] = useState( 0)
    const {loading, getInfo, requestMovement, requestRotation} = useRoverServer()

    useEffect(() => {
        getInfo().then((v) => {
            setCenter([v.position[0], v.position[1]])
        })
    }, []);

    useKeyDown((event) => {
        if(isMoving || loading) return
        switch (event.key) {
            case 'l':
                requestRotation('left').then(
                    ({angle}) => rotateRover(angle))
                break
            case 'r':
                requestRotation('right').then(
                    ({angle}) => rotateRover(angle))
                break
            case 'f':
                requestMovement('forward').then(
                    ({position, blocked}) => {
                        if(blocked) {
                            signalBlockedPath()
                        } else {
                            moveRover(position)
                        }
                    }
                )
                break
            case 'b':
                requestMovement('backward').then(
                    ({position, blocked}) => {
                        if(blocked) {
                            signalBlockedPath()
                        } else {
                            moveRover(position)
                        }
                    }
                )
                break
        }
    })

    const signalBlockedPath = () => {
        setIsBlocked(true)
        setTimeout(() => setIsBlocked(false),2000)
    }

    const rotateRover = (angle: number) => {
        setRoverRotation(angle)
        setIsMoving(true)
        setTimeout(() => setIsMoving(false), 500)
    }

    const adjustLongitude = (longitude: number) => {
        if(longitude > 85) {
            return longitude - 85 * 2
        } else if(longitude < -85) {
            return longitude + 85 * 2
        }
        return longitude
    }

    const moveRover = (finalPosition: [number, number]) => {
        if (!center) return;
        setIsMoving(true);
        const startTime = Date.now();
        const initialPosition = [...center];

        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const fraction = elapsedTime / MOVING_DURATION;

            if (fraction < 1) {
                const newLat = initialPosition[0] + (finalPosition[0] - initialPosition[0]) * fraction;
                const newLon = initialPosition[1] + (finalPosition[1] - initialPosition[1]) * fraction;
                setCenter([newLat, adjustLongitude(newLon)]);
                requestAnimationFrame(animate);
            } else {
                setCenter(finalPosition);
                setIsMoving(false);
            }
        };

        requestAnimationFrame(animate); // Start the animation
    };




    return (
        <div style={{position: "relative", perspective: '750px'}}>
            <div className={styles.messages} >
                <div>
                    {loading && <div className={styles.loader}>Loading...</div>}
                    {isBlocked && <div className={ styles.blockedSignal}>obstacle encountered!</div>}
                </div>
            </div>
            <Rover isMoving={isMoving} rotation={roverRotation} ready={mapReady}/>
            {center && <MarsMap center={center} onMapReady={() => setTimeout(() => setMapReady(true), 1500)}/>}
        </div>
    )
}
