import {useState} from "react";

type Point = [number, number];

interface RoverInfo {
    position: Point,
    angle: number,
    blocked?: boolean
}

interface Obstacle {
    bottomLeft: Point,
    topRight: Point
}

const obstacles: Obstacle[] = [
    { bottomLeft: [12, -6], topRight: [22, 2] }
]

const MOVING_UNIT = 5;
const ROTATING_UNIT = 15;

export const useRoverServer = () => {
    const [roverInfo, setRoverInfo] = useState<RoverInfo>( {
        position: [0,0],
        angle: 0,
    })

    const [loading, setLoading] = useState(false)

    const mockResponseWait = async(res?:RoverInfo): Promise<RoverInfo> => {
        setLoading(true);
        const response = new Promise<RoverInfo>((resolve) => {
            setTimeout(() => {
                resolve(res ?? roverInfo)
                setLoading(false)
            },  Math.random() * (3000 - 500) + 500)
        })
        return await response
    }

    const getInfo = async ()=> {
        console.log('rover info requested')
        return await mockResponseWait()
    };

    function intersects(
        lineStart: Point,
        lineEnd: Point,
        rectStart: Point,
        rectEnd: Point
    ): boolean {
        const [px1, py1] = lineStart;
        const [px2, py2] = lineEnd;
        const [qx1, qy1] = rectStart;
        const [qx2, qy2] = rectEnd;

        const s1_x = px2 - px1;
        const s1_y = py2 - py1;
        const s2_x = qx2 - qx1;
        const s2_y = qy2 - qy1;

        const s = (-s1_y * (px1 - qx1) + s1_x * (py1 - qy1)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = (s2_x * (py1 - qy1) - s2_y * (px1 - qx1)) / (-s2_x * s1_y + s1_x * s2_y);

        return s >= 0 && s <= 1 && t >= 0 && t <= 1;
    }


    const isPathBlocked = (start: Point, end: Point): boolean => {
        return obstacles.some(({ bottomLeft, topRight }) => {
            if (Math.max(start[0], end[0]) < bottomLeft[0] || Math.min(start[0], end[0]) > topRight[0] ||
                Math.max(start[1], end[1]) < bottomLeft[1] || Math.min(start[1], end[1]) > topRight[1]) {
                return false;
            }

            return (
                intersects(start, end, [bottomLeft[0], bottomLeft[1]], [topRight[0], bottomLeft[1]]) ||
                intersects(start, end, [topRight[0], bottomLeft[1]], [topRight[0], topRight[1]]) ||
                intersects(start, end, [topRight[0], topRight[1]], [bottomLeft[0], topRight[1]]) ||
                intersects(start, end, [bottomLeft[0], topRight[1]], [bottomLeft[0], bottomLeft[1]])
            );
        });
    };



    const requestMovement = async (direction: 'forward' | 'backward' ) => {
        console.log('rover movement requested')
        const directionMultiplier = direction === 'forward' ? 1 : -1;
        const lat = Math.sin(roverInfo.angle) * directionMultiplier * MOVING_UNIT;
        const lon = Math.cos(roverInfo.angle) * directionMultiplier * MOVING_UNIT;
        const newPosition: Point = [
            roverInfo.position[0] + lat,
            roverInfo.position[1] + lon,
        ];

        if (isPathBlocked(roverInfo.position, newPosition)) {
            console.log('Movement blocked by an obstacle');
            return mockResponseWait({
                ...roverInfo,
                blocked: true,
            });
        }

        const res = {
            ...roverInfo,
            position: newPosition,
            blocked: false,
        };
        setRoverInfo(res)
        return await mockResponseWait(res)
    }

    const requestRotation = async (direction: 'left' | 'right' ) => {
        console.log('rover rotation requested')
        const angle = direction === 'left' ? -Math.PI / ROTATING_UNIT : Math.PI / ROTATING_UNIT;
        const res = {
            ...roverInfo,
            angle: roverInfo.angle + angle,
        }
        setRoverInfo(res)
        return await mockResponseWait(res)
    }
    return {getInfo, requestMovement, requestRotation, loading}
}
