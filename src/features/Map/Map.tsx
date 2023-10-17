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
      [15, 8],
      [16, 8],
      [17, 8],
    ],
  });
  const [food, setFood] = useState<TPoint>([
    getRandom(1, MAP_WIDTH),
    getRandom(1, MAP_HEIGHT),
  ]);

  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const handlePressButton = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
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
          break;
        case 'KeyA':
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
          break;
      }
    };
    document.addEventListener('keydown', handlePressButton);
    return () => document.removeEventListener('keydown', handlePressButton);
  }, [player]);

  useEffect(() => {
    const handleEat = (player: TPlayer, food: TPoint) => {
      if (isPointIncluded(food, player.coords)) {
        setFood([getRandom(1, MAP_WIDTH), getRandom(1, MAP_HEIGHT)]);
        setScore(score + 1);
      }
    };
    handleEat(player, food);
  }, [player, food]);

  return (
    <div className={styles.map}>
      {generateMap(width, height).map((array) => (
        <div>
          {array.map((item) => (
            <div
              className={clsx(styles.square, {
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
      <div className={styles.score}>YOUR SCORE: {score}</div>
    </div>
  );
};

export default Map;
