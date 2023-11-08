import React, { useEffect, useState } from 'react';
import styles from './Map.module.scss';
import { TMap, TPlayer, TPoint } from './Map.type';
import clsx from 'clsx';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_SCORE_INTERVAL,
  MAX_TIME_INTERVAL,
  MIN_TIME_INTERVAL,
} from '../../consts/consts';

type TMapProps = TMap;

const getEnlargedSnake = (direction: string, player: TPlayer) => {
  let newPlayer = { ...player };
  let newHead: TPoint = [...newPlayer.coords[0]];

  switch (direction) {
    case 'KeyW':
      newHead[1] -= 1;
      break;

    case 'KeyS':
      newHead[1] += 1;
      break;

    case 'KeyA':
      newHead[0] -= 1;
      break;

    case 'KeyD':
      newHead[0] += 1;
      break;
  }

  newPlayer.coords.unshift(newHead);

  if (newPlayer.coords[0][0] > MAP_WIDTH) {
    newPlayer.coords[0][0] = 1;
  }
  if (newPlayer.coords[0][0] < 1) {
    newPlayer.coords[0][0] = MAP_WIDTH;
  }
  if (newPlayer.coords[0][1] > MAP_HEIGHT) {
    newPlayer.coords[0][1] = 1;
  }
  if (newPlayer.coords[0][1] < 1) {
    newPlayer.coords[0][1] = MAP_HEIGHT;
  }
  return newPlayer;
};

const getDirection = (direction: string, code: string) => {
  let newDirection = code;

  if (
    (direction === 'KeyA' && newDirection === 'KeyD') ||
    (direction === 'KeyD' && newDirection === 'KeyA') ||
    (direction === 'KeyW' && newDirection === 'KeyS') ||
    (direction === 'KeyS' && newDirection === 'KeyW')
  ) {
    return direction;
  }
  return newDirection;
};

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

const getEmptyCoords = (player: TPlayer) => {
  const superEmptyCoords = [];
  for (let i = 1; i <= MAP_HEIGHT; i++) {
    for (let j = 1; j <= MAP_WIDTH; j++) {
      if (!isPointIncluded([j, i], player.coords)) {
        superEmptyCoords.push([j, i]);
      }
    }
  }
  return superEmptyCoords;
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
  const [gameStatus, setGameStatus] = useState<'play' | 'win' | 'defeat'>(
    'play'
  );

  const emptyCoords = getEmptyCoords(player);
  const timeInterval = Math.max(
    -(MIN_TIME_INTERVAL / MAX_SCORE_INTERVAL) * score + MAX_TIME_INTERVAL,
    MIN_TIME_INTERVAL
  );

  const handlePressButton = (event: KeyboardEvent) => {
    let newPlayer: TPlayer;
    let newDirection = getDirection(direction, event.code);
    newPlayer = getEnlargedSnake(newDirection, player);

    if (isPointIncluded(food, newPlayer.coords)) {
      const randomIndex = getRandom(0, emptyCoords.length - 1);
      console.log(emptyCoords);
      const [foodX, foodY] = emptyCoords[randomIndex];
      setFood([foodX, foodY]);
      setScore(score + 1);
    } else {
      newPlayer.coords.pop();
    }
    let head = player.coords[0];
    if (isPointIncluded(head, newPlayer.coords.slice(1))) {
      setGameStatus('defeat');
      return;
    }
    if (emptyCoords.length === 0) {
      setGameStatus('win');
      return;
    }
    setPlayer(newPlayer);
    setDirection(newDirection);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (gameStatus !== 'play') return;
    document.addEventListener('keydown', handlePressButton);

    if (emptyCoords.length > 0 && gameStatus === 'play') {
      timeoutId = setTimeout(() => {
        handlePressButton({ code: direction } as KeyboardEvent);
      }, timeInterval);
    }

    return () => {
      document.removeEventListener('keydown', handlePressButton);
      clearTimeout(timeoutId);
    };
  }, [player, direction, emptyCoords, gameStatus]);

  useEffect(() => {
    if (emptyCoords.length === 0) setGameStatus('win');
  }, [emptyCoords]);

  const handleRestart = () => {
    setScore(0);
    setDirection('KeyD');
    setGameStatus('play');
    setPlayer({
      coords: [
        [3, 1],
        [2, 1],
        [1, 1],
      ],
    });
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={clsx(styles.finalBoard, {
          [styles.hidden]: gameStatus !== 'win',
          [styles.open]: gameStatus === 'win',
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
          [styles.hidden]: gameStatus !== 'defeat',
          [styles.open]: gameStatus === 'defeat',
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
      </div>
    </div>
  );
};

export default Map;
