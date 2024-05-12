'use client'
import MarsMap from "@/components/MarsMap";
import {useState} from "react";
import Rover from "@/components/Rover";

const MOVING_STEP = 1;
const MOVING_DURATION = 1000;
const ROTATING_STEP = 16;

export default function DriveRover() {
    const [center, setCenter] = useState<[number, number]>([0,0])
    const [mapReady, setMapReady] = useState(false)
    const [isMoving, setIsMoving] = useState(false)
    const [roverRotation, setRoverRotation] = useState( 0)
    const rotateRover = (direction: 'left' | 'right') => {
        var angle = direction === 'left' ? -Math.PI / ROTATING_STEP : Math.PI / ROTATING_STEP;
        setRoverRotation(roverRotation+angle)
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

    const moveRover = () => {
        setIsMoving(true)
        const steps = 50;
        const interval = MOVING_DURATION / steps;
        let stepCount = 0;
        const stepLat = Math.sin(roverRotation) * MOVING_STEP / steps;
        const stepLon = Math.cos(roverRotation) * MOVING_STEP / steps;
        let currentCenter = [...center] as [number, number];

        const moveStep = () => {
            const newLat = currentCenter[0] + stepLat;
            const newLon = adjustLongitude(currentCenter[1] + stepLon)

            currentCenter = [newLat, newLon] as [number, number];
            setCenter(currentCenter);
            stepCount++;

            if (stepCount < steps) {
                setTimeout(moveStep, interval);
            } else {
                setCenter([
                    center[0] + Math.sin(roverRotation) * MOVING_STEP,
                    adjustLongitude(center[1] + Math.cos(roverRotation) * MOVING_STEP)
                ]);
                setIsMoving(false)

            }
        };

        setTimeout(moveStep, interval);
    }

    return (
        <div style={{position: "relative", perspective: '750px'}}>
            <div style={{position: "absolute", top: 10, right: 10, zIndex: 10, display: "inline-flex"}}>
                <button onClick={() => rotateRover('left')}>
                    rotate L
                </button>
                <button onClick={moveRover}>
                    forward
                </button>
                <button onClick={() => rotateRover('right')}>
                    rotate R
                </button>
            </div>
            <Rover isMoving={isMoving} rotation={roverRotation} ready={mapReady}/>
            <MarsMap center={center} onMapReady={() => setTimeout(() => setMapReady(true), 1500)} />
        </div>
    )
}
