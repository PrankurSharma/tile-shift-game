export default function Tile({
  value,
  tiles,
  setTiles,
  tileClick,
  countMoves,
  setCountMoves,
  setIsTileClicked,
  visited,
  setVisited,
}) {
  const handleClick = () => {
    if (tileClick) {
      tileClick(tiles, value);
      visited.add(tiles.toString());
      setVisited(visited);
      countMoves++;
      setCountMoves();
      setTiles([...tiles]);
      setIsTileClicked(false);
    }
  };
  return (
    <div className="tile">
      <div
        className={value !== null ? "inner-tile" : "inner-tile-empty"}
        onClick={handleClick}
      >
        {value}
      </div>
    </div>
  );
}
