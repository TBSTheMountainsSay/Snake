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
      [5, 2],
      [6, 2],
      [7, 2],
    ],
  });
  const [food, setFood] = useState<TPoint>([
    getRandom(1, MAP_WIDTH),
    getRandom(1, MAP_HEIGHT),
  ]);

  const [score, setScore] = useState<number>(0);
  const [direction, setDirection] = useState<string>('KeyA');
  const [isDefeated, setIsDefeated] = useState<boolean>(false);

  const foodCoords = Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, (_, i) => [
    (i % MAP_WIDTH) + 1,
    Math.floor(i / MAP_WIDTH) + 1,
  ]).filter((coord) => !isPointIncluded([coord[0], coord[1]], player.coords));

  const randomIndex = getRandom(0, foodCoords.length - 1);
  const [foodX, foodY] = foodCoords[randomIndex];

  const handlePressButton = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
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
        break;
      case 'KeyS':
        setDirection('KeyS');
        player.coords[0][1] >= MAP_HEIGHT
          ? setPlayer({
              coords: [[player.coords[0][0], 1], ...player.coords.slice(0, -1)],
            })
          : setPlayer({
              coords: [
                [player.coords[0][0], player.coords[0][1] + 1],
                ...player.coords.slice(0, -1),
              ],
            });
        break;
      case 'KeyA':
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
        break;
      case 'KeyD':
        setDirection('KeyD');
        player.coords[0][0] >= MAP_WIDTH
          ? setPlayer({
              coords: [[1, player.coords[0][1]], ...player.coords.slice(0, -1)],
            })
          : setPlayer({
              coords: [
                [player.coords[0][0] + 1, player.coords[0][1]],
                ...player.coords.slice(0, -1),
              ],
            });
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handlePressButton);

    const timeoutId = setTimeout(() => {
      handlePressButton({ code: direction } as KeyboardEvent);
    }, 250);

    return () => {
      document.removeEventListener('keydown', handlePressButton);
      clearTimeout(timeoutId);
    };
  }, [player, direction]);

  useEffect(() => {
    const handleEat = (player: TPlayer, food: TPoint) => {
      if (isPointIncluded(food, player.coords)) {
        setFood([foodX, foodY]);
        setScore(score + 1);
        setPlayer({ coords: [...player.coords, food] });
      }
    };
    handleEat(player, food);
  }, [player, food]);

  return (
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
  );
};

export default Map;
