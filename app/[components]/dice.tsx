"use client"
import React, { useRef, useState } from 'react';

const Dice3D: React.FC = () => {

    const getDots = (face: number) => {
        const positions: Record<number, [number, number][]> = {
            1: [[50, 50]],
            2: [[25, 25], [75, 75]],
            3: [[25, 25], [50, 50], [75, 75]],
            4: [[25, 25], [25, 75], [75, 25], [75, 75]],
            5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
            6: [[25, 25], [25, 75], [50, 25], [50, 75], [75, 25], [75, 75]],
        };

        return positions[face].map(([top, left], i) => (
            <div
                key={i}
                style={{
                    ...styles.dot,
                    top: `${top}%`,
                    left: `${left}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            />
        ));
    };


    const styles: Record<string, React.CSSProperties> = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'sans-serif',
        },
       scene: {
  width: '100px',
  height: '100px',
  perspective: '600px',
  marginBottom: '20px',
},
cube: {
  width: '100%',
  height: '100%',
  position: 'relative',
  transformStyle: 'preserve-3d',
  transition: 'transform 1s ease-in-out',
},
face: {
  position: 'absolute',
  width: '100px',
  height: '100px',
  background: '#f44f4fff',
  boxSizing: 'border-box',
  borderRadius:"10px"
},
dot: {
  width: '10px',  // smaller for smaller dice
  height: '10px',
  backgroundColor: '#ffffffff',
  borderRadius: '50%',
  position: 'absolute',
},
// 3D face positions now use 50px
face1: { transform: 'rotateY(0deg) translateZ(50px)' },
face2: { transform: 'rotateY(90deg) translateZ(50px)' },
face3: { transform: 'rotateY(180deg) translateZ(50px)' },
face4: { transform: 'rotateY(-90deg) translateZ(50px)' },
face5: { transform: 'rotateX(90deg) translateZ(50px)' },
face6: { transform: 'rotateX(-90deg) translateZ(50px)' },
    };


    const [result, setResult] = useState<number | null>(null);
    const [turns, setTurns] = useState(0);
    const cubeRef = useRef<HTMLDivElement | null>(null);

    const faceRotation: Record<number, { x: number; y: number }> = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: -90 },
        3: { x: 0, y: -180 },
        4: { x: 0, y: 90 },
        5: { x: -90, y: 0 },
        6: { x: 90, y: 0 },
    };

    const rollFromServer = async () => {
        // Simulate server result (1–6)
        const serverNumber = Math.floor(Math.random() * 6) + 1;

        const rotate = faceRotation[serverNumber];
        const newTurns = turns + 1;
        setTurns(newTurns);

        const x = rotate.x + newTurns * 360;
        const y = rotate.y + newTurns * 360;

        if (cubeRef.current) {
            cubeRef.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
        }

        setResult(serverNumber);
    };

    return (
        <div style={styles.container}>
            <div style={styles.scene}>
                <div style={styles.cube} ref={cubeRef} onClick={rollFromServer}>
                    {[1, 2, 3, 4, 5, 6].map((face) => (
                        <div key={face} style={{ ...styles.face, ...styles[`face${face}` as keyof typeof styles] }}>
                            {getDots(face)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dice3D;
