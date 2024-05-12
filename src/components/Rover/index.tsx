import {FC, useEffect} from "react";
import clsx from "clsx";
import styles from "./Rover.module.scss";
import {useRive, useStateMachineInput} from "@rive-app/react-canvas";
import RoverRiveFile from "./rover.riv";


interface Props {
    rotation: number
    ready: boolean,
    isMoving: boolean
}

const STATE_MACHINE = "rover states"

const Rover:FC<Props> = ({
    rotation = 0,
    ready = false,
    isMoving = false
                  }) => {
    const { rive, RiveComponent } = useRive({
        src: RoverRiveFile,
        artboard: "rover",
        stateMachines: STATE_MACHINE,
        autoplay: false,
    })

    const move = useStateMachineInput(rive, STATE_MACHINE, "run", isMoving);

    useEffect(() => {
        if(rive && ready) {
            rive.play(STATE_MACHINE)
        }
    }, [ready, rive])

    useEffect(() => {
        if(rive && move) {
            move.value=isMoving
        }
    }, [rive, isMoving]);

    if(!ready) return null

    return (
        <div
            className={clsx(styles.rover)}
            style={{
                rotate: `${rotation}rad`,
            }}>
            <RiveComponent  />
        </div>
    )
}

export default Rover
