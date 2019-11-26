import { pipe } from "ramda";
import { Props } from "./index";
import {
  matrixTransform,
  rotateXMatrix4,
  rotateYMatrix4,
  rotateZMatrix4,
  rotateXYMatrix4
} from "./matrixUtils";
import { Point, Shape } from "./Shape";

const { PI } = Math;
const hypercube = Shape.hypercube();
// .map(
//   matrixTransform(
//     rotateZMatrix4(PI / 4),
//     // prettier-ignore
//     [
//       [1, 0, 0, 0],
//       [0, 1, 0.9, 0],
//       [0, 0, 1, 0],
//       [0, 0, 0, 1]
//     ],
//     rotateZMatrix4(PI / 2)
//   )
// );

export function hypercubeState(props: Props) {
  const to2dPoint = perspective(props.perspectiveZ, props.perspectiveW);

  return hypercube.map(
    pipe(
      rotate(props),
      to2dPoint,
      recenter
    )
  );
}

function rotate(axis: Props) {
  return matrixTransform(
    rotateZMatrix4(PI / 4),
    // prettier-ignore
    [
      [1, 0, 0, 0],
      [0, 1, axis.skew ? 0.9 : 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ],
    rotateZMatrix4(PI / 2),
    rotateXMatrix4(axis.rotateX),
    rotateYMatrix4(axis.rotateY),
    rotateZMatrix4(axis.rotateZ),
    rotateXYMatrix4(axis.rotateW)
  );
}

function perspective(perspectiveZ: number, perspectiveW: number) {
  return function(point: Point): Point {
    const [x = 1, y = 1, z = 1, w = 1] = moveCameraBackward(point);
    const coeff = (-1 * perspectiveZ * z + 1) * (-1 * perspectiveW * w + 1);
    return [x * coeff, y * coeff, coeff];
  };
}

function scaleHalf(point: Point): Point {
  return (point as number[]).map(val => val / 2) as Point;
}

function moveCameraBackward([x = 1, y = 1, z = 1, w = 1]: Point): Point {
  return scaleHalf([x - 0.5, y, z + 1, w + 1]);
}

function recenter([x = 1, y = 1, distance = 0]: Point): Point {
  return [x * 0.522 + 0.025, y * 0.522, distance];
}
