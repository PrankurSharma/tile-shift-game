import { useEffect, useState } from "react";
import Overlay from "./Overlay";
import Stopwatch from "./Stopwatch";
import Tile from "./Tile";

export default function Puzzle({ size }) {
  const [isTileClicked, setIsTileClicked] = useState(false);
  const [visited, setVisited] = useState(new Set());
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [finalMoves, setFinalMoves] = useState([]);
  const [isReset, setIsReset] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [solvable, setSolvable] = useState(false);
  let [countMoves, setCountMoves] = useState(0);
  const createTiles = (size) => {
    let arr = Array.from({ length: size * size - 1 }, (x, idx) => idx + 1);
    arr.push(null);
    shuffle(arr);
    return arr;
  };
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  };

  let [tiles, setTiles] = useState(createTiles(4));

  console.log("Tiles: ", tiles);

  const tileClick = (tiles, value) => {
    console.log("Clicked", tiles);
    const emptyIdx = tiles.indexOf(null);
    const selectedIdx = tiles.indexOf(value);

    console.log("Tile idx: ", emptyIdx, selectedIdx);

    if (isAdjacent(selectedIdx, emptyIdx)) {
      let temp = tiles[selectedIdx];
      tiles[selectedIdx] = tiles[emptyIdx];
      tiles[emptyIdx] = temp;

      console.log("Tiles final: ", tiles);
      //setTiles([...tiles]);
    }
  };

  const isAdjacent = (selectedIdx, emptyIdx) => {
    const dist = Math.abs(selectedIdx - emptyIdx);
    let size = 4;
    console.log("Distance: ", selectedIdx % size, emptyIdx);
    if (selectedIdx % size === 3 && selectedIdx + 1 === emptyIdx) {
      return false;
    } else if (emptyIdx % size === 3 && emptyIdx + 1 === selectedIdx) {
      return false;
    }
    //else if()
    return (
      dist === size || (dist === 1 && selectedIdx % size !== emptyIdx % size)
    );
  };

  const isSolved = (tiles) => {
    return tiles.every(
      (val, idx) =>
        val === idx + 1 || (val === null && idx === tiles.length - 1)
    );
  };

  const handleStart = () => {
    setTiles(createTiles(size));
  };

  const checkSolvable = (tiles, size) => {
    let queue = [];
    const visited = new Set();
    queue.push({ state: tiles });
    visited.add(tiles.toString());
    while (queue.length > 0) {
      let { state } = queue.shift();
      if (isSolved(state)) {
        return finalMoves;
      }
      let currentEmpty = state.indexOf(null);
      let possibleMoves = getPossibleMoves(currentEmpty, 4);
      //console.log("Possible moves: ", possibleMoves);
      let { puzzles, selectedIndices } = getPuzzleStatesAfterSwap(
        possibleMoves,
        state
      );
      for (let i = 0; i < puzzles.length; i++) {
        console.log("Possible moves", visited, puzzles[i].toString());
        if (!visited.has(puzzles[i].toString())) {
          queue.push({ state: puzzles[i] });
          visited.add(puzzles[i].toString());
          finalMoves.push(selectedIndices[i]);
        }
      }
    }
    console.log("Final moves: ", finalMoves);

    return null;
  };

  const getPuzzleStatesAfterSwap = (possibleMoves, tiles) => {
    let puzzles = [];
    let selectedIndices = [];
    for (let move of possibleMoves) {
      let newPuzzle = [...tiles];
      tileClick(newPuzzle, newPuzzle[move]);
      puzzles.push(newPuzzle);
      selectedIndices.push(move);
    }
    return { puzzles, selectedIndices };
  };

  const getPossibleMoves = (currentEmpty, size) => {
    console.log("Current Empty", currentEmpty, size);
    let elements = [];
    if (currentEmpty - size >= 0) {
      elements.push(currentEmpty - size);
    }
    if (currentEmpty % size !== 3 && currentEmpty + 1 <= 15) {
      elements.push(currentEmpty + 1);
    }
    if (currentEmpty + size <= 15) {
      elements.push(currentEmpty + size);
    }
    if (currentEmpty - 1 >= 0 && (currentEmpty - 1) % size !== 3) {
      elements.push(currentEmpty - 1);
    }
    shuffle(elements);
    return elements;
  };

  const generateNextMove = (tiles) => {
    visited.add(tiles.toString());

    if (isSolved(tiles)) {
      return null;
    }
    console.log("Enters...");

    let arr = [...tiles];
    let currentEmpty = arr.indexOf(null);
    let moves = getPossibleMoves(currentEmpty, 4);
    console.log("Moves: ", moves);
    for (let move of moves) {
      let myArr = [...arr];
      let tileMove = tileClick(myArr, myArr[move]);
      console.log("After tile click: ", myArr, visited);
      if (!visited.has(myArr.toString())) {
        visited.add(myArr.toString());
        console.log("Sets the tiles: ", visited);
        setVisited(visited);
        setTiles([...myArr]);
        return move;
      }
      // else {
      //     arr = [...tiles];
      // }
    }
    return null;
  };

  function isSolvable(tiles) {
    const width = 4;
    let inversions = 0;

    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] === 0) continue; // Skip the empty tile
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[j] !== 0 && tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }

    return (
      (width % 2 === 0 && inversions % 2 !== 0) ||
      (width % 2 === 1 && inversions % 2 === 0)
    );
  }
  useEffect(() => {
    if (isReset) {
      if (isSolvable(tiles)) {
        // let moves = checkSolvable(tiles, 4);
        // if (moves !== null) {
        //   setFinalMoves([...moves]);
        // }
        setSolvable(true);
      } else {
        setSolvable(false);
      }
    }
  }, [isReset, tiles]);
  return (
    <div className="puzzle">
      <div className="grid">
        <Overlay
          visibility={isReset || isPaused}
          isPaused={isPaused}
          isReset={isReset}
          setIsReset={setIsReset}
          setIsPaused={setIsPaused}
        />
        {tiles.map((val) => {
          return (
            <Tile
              key={val}
              value={val}
              tiles={tiles}
              setTiles={setTiles}
              tileClick={tileClick}
              setIsTileClicked={setIsTileClicked}
              countMoves={countMoves}
              setCountMoves={setCountMoves}
              visited={visited}
              setVisited={setVisited}
            />
          );
        })}
      </div>
      <div className="btn-div">
        <button
          className="btn-style"
          onClick={() => {
            //setIsReset((isReset) => !isReset);
            if (isReset) {
              setIsPaused(false);
              setIsReset((isReset) => !isReset);
            } else {
              setIsReset(false);
              setIsPaused((isPaused) => !isPaused);
            }
          }}
        >
          {isPaused || isReset ? "Start" : "Pause"}
        </button>
        {solvable && (
          <button
            className="btn-style"
            onClick={() => {
              if (!isReset && !isPaused && solvable && !isSolved(tiles)) {
                // console.log("Final moves: ", finalMoves);
                // let move = finalMoves.shift();
                // tileClick(tiles, tiles[move]);
                // setTiles([...tiles]);

                let move = generateNextMove(tiles);
                tileClick(tiles, tiles[move]);
                countMoves++;
                setCountMoves(countMoves);
                setTiles([...tiles]);

                // let move = checkSolvable(tiles, 4);
                // tileClick(tiles, tiles[move]);
                // setTiles([...tiles]);
              }
            }}
          >
            Help
          </button>
        )}
        <button
          className="btn-style"
          onClick={() => {
            setIsReset(true);
            console.log("Tiles: ", tiles);
            for (let i = 0; i < 16; i++) {
              if (i !== 15) {
                tiles[i] = i + 1;
              } else {
                tiles[i] = null;
              }
            }
            console.log("Sorted: ", tiles);
            setTiles([...tiles]);
            setTimeout(() => {
              shuffle(tiles);
              setTiles([...tiles]);
            }, 1000);
          }}
        >
          Reset
        </button>
      </div>
      <div className="btn-div">
        <div className="stop-div">
          <h3>MOVES</h3>
          <p>{isSolved(tiles) && !isReset && !isPaused ? countMoves : "0"}</p>
        </div>
        <Stopwatch isReset={isReset} isPaused={isPaused} />
      </div>
      <p>{solvable ? "" : "Unsolvable"}</p>
    </div>
  );
}
