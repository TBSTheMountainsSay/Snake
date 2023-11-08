import React, { useEffect, useState } from 'react';
import styles from './Map.module.scss';
import { TMap, TPlayer, TPoint } from './Map.type';
import clsx from 'clsx';
import { MAP_HEIGHT, MAP_WIDTH } from '../../consts/consts';

type TMapProps = TMap;

const getRandom = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min) + min);
};

const generateMap = (width: number, height: number): [number, number][][] => {
  const map: [number, number][][] = [];
  for (let i = 1; i <= height; i++) {
    const row: [number, number][] = [];
    for (let j = 1; j <= width; j++) {
      row.push([i, j]);
    }
    map.push(row);
  }
  return map;
};

const isSamePoints = (firstPoint: TPoint, secondPoint: TPoint): boolean =>
  firstPoint[0] === secondPoint[0] && firstPoint[1] === secondPoint[1];

const isPointIncluded = (point: TPoint, pointsArray: TPoint[]): boolean =>
  pointsArray.some((arrayPoint: TPoint) => isSamePoints(point, arrayPoint));

const Map: React.FC<TMapProps> = ({ width, height }) => {
  const [player, setPlayer] = useState<TPlayer>({
    coords: [
      [3, 1],
      [2, 1],
      [1, 1],
    ],
  });
  const [food, setFood] = useState<TPoint>([
    getRandom(1, MAP_WIDTH),
    getRandom(1, MAP_HEIGHT),
  ]);

  const [score, setScore] = useState<number>(0);
  const [direction, setDirection] = useState<string>('KeyD');
  const [isDefeated, setIsDefeated] = useState<boolean>(false);
  const [isWinning, setIsWinning] = useState<boolean>(false);

  const emptyCoords = Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, (_, i) => [
    (i % MAP_WIDTH) + 1,
    Math.floor(i / MAP_WIDTH) + 1,
  ]).filter((coord) => !isPointIncluded([coord[0], coord[1]], player.coords));

  const randomIndex = getRandom(0, emptyCoords.length - 1);
  const [foodX, foodY] = emptyCoords[randomIndex];

  const handlePressButton = (event: KeyboardEvent) => {
    if (player.coords.length <= MAP_WIDTH * MAP_HEIGHT - 1) {
      switch (event.code) {
        case 'KeyW':
          if (direction !== 'KeyS') {
            setDirection('KeyW');
            player.coords[0][1] <= 1
              ? setPlayer({
                  coords: [
                    [player.coords[0][0], MAP_HEIGHT],
                    ...player.coords.slice(0, -1),
                  ],
                })
              : setPlayer({
                  coords: [
                    [player.coords[0][0], player.coords[0][1] - 1],
                    ...player.coords.slice(0, -1),
                  ],
                });
          }
          break;
        case 'KeyS':
          if (direction !== 'KeyW') {
            setDirection('KeyS');
            player.coords[0][1] >= MAP_HEIGHT
              ? setPlayer({
                  coords: [
                    [player.coords[0][0], 1],
                    ...player.coords.slice(0, -1),
                  ],
                })
              : setPlayer({
                  coords: [
                    [player.coords[0][0], player.coords[0][1] + 1],
                    ...player.coords.slice(0, -1),
                  ],
                });
          }
          break;
        case 'KeyA':
          if (direction !== 'KeyD') {
            setDirection('KeyA');
            player.coords[0][0] <= 1
              ? setPlayer({
                  coords: [
                    [MAP_WIDTH, player.coords[0][1]],
                    ...player.coords.slice(0, -1),
                  ],
                })
              : setPlayer({
                  coords: [
                    [player.coords[0][0] - 1, player.coords[0][1]],
                    ...player.coords.slice(0, -1),
                  ],
                });
          }
          break;
        case 'KeyD':
          if (direction !== 'KeyA') {
            setDirection('KeyD');
            player.coords[0][0] >= MAP_WIDTH
              ? setPlayer({
                  coords: [
                    [1, player.coords[0][1]],
                    ...player.coords.slice(0, -1),
                  ],
                })
              : setPlayer({
                  coords: [
                    [player.coords[0][0] + 1, player.coords[0][1]],
                    ...player.coords.slice(0, -1),
                  ],
                });
          }
          break;
      }
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    document.addEventListener('keydown', handlePressButton);

    if (player.coords.length <= MAP_WIDTH * MAP_HEIGHT - 1) {
      timeoutId = setTimeout(() => {
        handlePressButton({ code: direction } as KeyboardEvent);
      }, 300);
    }

    return () => {
      document.removeEventListener('keydown', handlePressButton);
      clearTimeout(timeoutId);
    };
  }, [player, direction]);

  useEffect(() => {
    let head = player.coords[0];
    let newPlayer = { ...player };
    const CheckCell = (head: TPoint, food: TPoint) => {
      if (isPointIncluded(food, player.coords)) {
        newPlayer = { ...newPlayer, coords: [food, ...player.coords] };
        setFood([foodX, foodY]);
        setScore(score + 1);
        setPlayer(newPlayer);
      }
      if (isPointIncluded(head, newPlayer.coords.slice(2))) {
        setIsDefeated(true);
      }
    };
    CheckCell(head, food);
  }, [player, food]);

  useEffect(() => {
    if (emptyCoords.length === 0) setIsWinning(true);
  }, [emptyCoords]);

  const handleRestart = () => {
    setScore(0);
    setDirection('KeyA');
    setIsWinning(false);
    setIsDefeated(false);
    setPlayer({
      coords: [
        [5, 2],
        [6, 2],
        [7, 2],
      ],
    });
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={clsx(styles.finalBoard, {
          [styles.hidden]: !isWinning,
          [styles.open]: isWinning,
        })}
      >
        <div className={styles.title}>CONGRATULATIONS! YOU WIN!</div>
        <div className={styles.subtitle}>YOUR SCORE: {score} </div>
        <button className={styles.restart} onClick={handleRestart}>
          restart
        </button>
      </div>
      <div
        className={clsx(styles.finalBoard, {
          [styles.hidden]: !isDefeated,
          [styles.open]: isDefeated,
        })}
      >
        <div className={styles.title}>YOU LOSE! </div>
        <div className={styles.subtitle}>YOUR SCORE: {score} </div>
        <button className={styles.restart} onClick={handleRestart}>
          restart
        </button>
      </div>
      <div className={styles.map}>
        <div className={styles.score}>YOUR SCORE: {score}</div>
        {generateMap(width, height).map((array) => (
          <div>
            {array.map((item) => (
              <div
                className={clsx(styles.square, {
                  [styles.head]: isSamePoints(
                    [item[1], item[0]],
                    player.coords[0]
                  ),
                  [styles.player]: isPointIncluded(
                    [item[1], item[0]],
                    player.coords
                  ),
                  [styles.food]: isSamePoints([item[1], item[0]], food),
                })}
              />
            ))}
          </div>
        ))}
      </div>{' '}
    </div>
  );
};

export default Map;
