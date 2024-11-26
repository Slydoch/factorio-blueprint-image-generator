
const directions = {
  north: 0,
  northnortheast: 1,
  northeast: 2,
  eastnortheast: 3,
  east: 4,
  eastsoutheast: 5,
  southeast: 6,
  southsoutheast: 7,
  south: 8,
  southsouthwest: 9,
  southwest: 10,
  westsouthwest: 11,
  west: 12,
  westnorthwest: 13,
  northwest: 14,
  northnorthwest: 15
};
const reverseDirections = {
  north: directions.south,
  northnortheast: directions.southsouthwest,
  northeast: directions.southwest,
  eastnortheast: directions.westsouthwest,
  east: directions.west,
  eastsoutheast: directions.westnorthwest,
  southeast: directions.northwest,
  southsoutheast: directions.northnorthwest,
  south: directions.north,
  southsouthwest: directions.northeast,
  southwest: directions.eastnortheast,
  westsouthwest: directions.east,
  west: directions.east,
  westnorthwest: directions.eastsoutheast,
  northwest: directions.southeast,
  northnorthwest: directions.southsoutheast
};


class FactorioUtil {
  static _directions = directions;
  static _reverseDirections = reverseDirections;
}

export default FactorioUtil;