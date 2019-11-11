interface Dict<T = any> {
  [index: string]: T
}

export type Point =
  | []
  | [number]
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]

type Ref = string
type Line = [Point, Point]
type LineRefs = [Ref, Ref]

export class Shape {
  public static of({ points = {}, vertexs = [] }) {
    return new Shape(points, vertexs)
  }

  public static empty() {
    return Shape.of({ points: {}, vertexs: [] })
  }

  public static point() {
    return Shape.of({ points: { a: [] }, vertexs: [] })
  }

  public static dimensionPrimitive(dimensions: number): Shape {
    // primitive(1) == point
    // primitive(1) == line
    // primitive(2) == square
    // primitive(3) == cube
    // primitive(4) == hypercube
    if (dimensions == 0) {
      return Shape.point()
    } else {
      return extrude(Shape.dimensionPrimitive(dimensions - 1))
    }
  }

  public static hypercube() {
    return Shape.dimensionPrimitive(4)
  }

  public points: Dict<Point> = {}
  private lineRefs: LineRefs[] = []

  constructor(points: Dict<Point>, lines: LineRefs[]) {
    this.points = points
    this.lineRefs = lines
  }

  public get lines(): Line[] {
    return this.lineRefs.map(([from, to]) => [
      this.points[from],
      this.points[to],
    ])
  }

  public map(fn: (key: Point) => Point): Shape {
    return new Shape(mapValues(fn)(this.points), this.lineRefs)
  }

  public mapKeys(fn: (key: string) => string): Shape {
    return new Shape(mapKeys(fn)(this.points), this.lineRefs.map(xs =>
      xs.map(fn),
    ) as LineRefs[])
  }

  public merge(graph: Shape): Shape {
    return new Shape(
      Object.assign({}, this.points, graph.points),
      this.lineRefs.concat(graph.lineRefs),
    )
  }
}

function extrude(shape: Shape): Shape {
  return merge(
    shape.map(pt => [...pt, -1] as Point).mapKeys(key => key + 'a'),
    shape.map(pt => [...pt, 1] as Point).mapKeys(key => key + 'b'),
    new Shape({}, Object.keys(shape.points).map(key => [key + 'a', key + 'b'])),
  )
}

interface Mergeable<T = any> {
  merge: (b: T) => T
}

function merge<T extends Mergeable>(first: T, ...mergeables: T[]) {
  return mergeables.reduce((acc, x) => acc.merge(x), first)
}

function mapKeys(fn: (a: string) => string) {
  return <U, T extends Dict<U>>(obj: T): T => {
    return Object.keys(obj).reduce(
      (acc, key) => {
        ;(acc as any)[fn(key)] = obj[key]
        return acc
      },
      {} as T,
    )
  }
}

function mapValues<T>(fn: (a: T) => T) {
  return (obj: Dict<T>): Dict<T> =>
    Object.keys(obj).reduce(
      (acc, key) => ((acc[key] = fn(obj[key])), acc),
      {} as Dict<T>,
    )
}
