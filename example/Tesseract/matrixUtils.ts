import { Point } from './Shape'

type Matrix4x4 = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
]

export function matrixTransform(...matrixs: Matrix4x4[]) {
  let matrix: Matrix4x4

  if (matrixs.length == 1) {
    matrix = matrixs[0]
  } else {
    matrix = matrixs.reduceRight(matrixMultiply)
  }

  return function(point: Point) {
    if (matrix.length < point.length) {
      throw new Error(`\
Error:
Matrix and point must have the same dimension: given matrix has ${matrix.length} but given point has ${point.length}`)
    }

    return (point as number[]).map((_, row) =>
      (point as number[]).reduce(
        (acc, n, col) => acc + n * matrix[row][col],
        0,
      ),
    ) as Point
  }
}

export function matrixMultiply(m1: Matrix4x4, m2: Matrix4x4) {
  return m1.map((_, i) =>
    m2.map((_, j) => m1.reduce((acc, _, k) => acc + m1[i][k] * m2[k][j], 0)),
  ) as Matrix4x4
}

export function rotateXYMatrix4(angle = 0) {
  const s = Math.sin(angle)
  const c = Math.cos(angle)

  // prettier-ignore
  return [
    [1, 0, 0, 0], 
    [0, 1, 0, 0], 
    [0, 0, c, -s], 
    [0, 0, s, c],
  ] as Matrix4x4
}

export function rotateXMatrix4(angle = 0) {
  const s = Math.sin(angle)
  const c = Math.cos(angle)

  // prettier-ignore
  return [
    [1, 0, 0, 0], 
    [0, c, -s, 0], 
    [0, s, c, 0], 
    [0, 0, 0, 1],
  ] as Matrix4x4
}
export function rotateZMatrix4(angle = 0) {
  const s = Math.sin(angle)
  const c = Math.cos(angle)

  // prettier-ignore
  return [
    [c, -s, 0, 0], 
    [s, c, 0, 0], 
    [0, 0, 1, 0], 
    [0, 0, 0, 1],
  ] as Matrix4x4
}
export function rotateYMatrix4(angle = 0) {
  const s = Math.sin(angle)
  const c = Math.cos(angle)

  // prettier-ignore
  return [
    [c, 0, 0, s], 
    [0, 1, 0, 0], 
    [0, 0, 1, 0], 
    [-s, 0, 0, c],
  ] as Matrix4x4
}
