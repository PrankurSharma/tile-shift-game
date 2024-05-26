import { useEffect, useState } from "react";
import Overlay from "./Overlay";
import Stopwatch from "./Stopwatch";
import Tile from "./Tile";

export default function Puzzle({ size }) {
  const [isTileClicked, setIsTileClicked] = useState(false); //checks if the tile swap operation has been performed by the user
  const [visited, setVisited] = useState(new Set()); //this set maintains the puzzle combinations already traversed by the Help button or manually by the user.
  const [finalMoves, setFinalMoves] = useState([]); //this is not being used in the approach currently implementd. It is useful for storing the list of moves a user will make in order to solve the puzzle.
  const [isReset, setIsReset] = useState(true); //if the board was reset by any means
  const [isPaused, setIsPaused] = useState(false); //if the game was paused by the user
  const [solvable, setSolvable] = useState(false); //checks if the current board is solvable.
  let [countMoves, setCountMoves] = useState(0); //counts the no of moves made by the user. It becomes visible after the user successfully solves the puzzle

  //this function is used to create tiles inside the puzzle initially.
  const createTiles = (size) => {
    let arr = Array.from({ length: size * size - 1 }, (x, idx) => idx + 1);
    arr.push(null);
    shuffle(arr);
    return arr;
  };

  //it is used to suffle the board when the user clicks reset or initially.
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  };

  let [tiles, setTiles] = useState(createTiles(4)); //this state stores the puzzle array.

  //this function makes a move if the tile can be swapped with the empty tile.
  const tileClick = (tiles, value) => {
    console.log("Clicked", tiles);
    const emptyIdx = tiles.indexOf(null); //finds the empty index
    const selectedIdx = tiles.indexOf(value); //finds the index of the clicked tile

    //checks if the selected tile is adjacent to the empty tile. If it is, it gets swapped with the empty tile.
    if (isAdjacent(selectedIdx, emptyIdx)) {
      let temp = tiles[selectedIdx];
      tiles[selectedIdx] = tiles[emptyIdx];
      tiles[emptyIdx] = temp;
    }
  };

  //checks if the selected tile is adjacent to the empty tile
  const isAdjacent = (selectedIdx, emptyIdx) => {
    const dist = Math.abs(selectedIdx - emptyIdx);
    let size = 4;
    //handling the edge cases in which the last element should not be swapped with the first element of the next row and vice versa.
    if (selectedIdx % size === 3 && selectedIdx + 1 === emptyIdx) {
      return false;
    } else if (emptyIdx % size === 3 && emptyIdx + 1 === selectedIdx) {
      return false;
    }
    //handling the case of moving the tiles up, down, left or right
    return (
      dist === size || (dist === 1 && selectedIdx % size !== emptyIdx % size)
    );
  };

  //this checks if the puzzle is solved i.e. all the elements are there at their appropriate index. 

  const isSolved = (tiles) => {
    return tiles.every(
      (val, idx) =>
        val === idx + 1 || (val === null && idx === tiles.length - 1)
    );
  };

  /*
  
  This function is not being used anywhere currently.
  This is an alternate which we can use to check if the puzzle is solvable. If it is solvable, and reaches the solved state, it returns all the moves made.

  I used BFS to write this function. The disadvantage of this function is the no. of moves it takes. Sometimes, it can even take more than 10000+ moves to solve the puzzle entirely.
  So, in order to avoid the increased time complexity of the solution, I avoided using it.

  If used, I will call this puzzle initially when it gets generated. So, it will generate all the possible moves  from that state. However, if the user makes a move instead, it will calculate
  all the steps again.
  
  */

  const checkSolvable = (tiles, size) => {
    let queue = []; //this queue maintains all the board configurations
    const visited = new Set(); //this set includes all the combinations that have been visited.
    queue.push({ state: tiles }); //pushing the initial state.
    visited.add(tiles.toString()); //pushing the existing state to visited set.
    while (queue.length > 0) {
      let { state } = queue.shift(); //considering the first element from the queue

      //if the puzzle reaches the solved state, return all the selected keys.
      if (isSolved(state)) {
        return finalMoves;
      }
      let currentEmpty = state.indexOf(null);
      let possibleMoves = getPossibleMoves(currentEmpty, 4); //this will get all the possible moves from the current state of the baord
      
      //this will give us all the possible index moves and puzzle configurations after moving the pieces.
      let { puzzles, selectedIndices } = getPuzzleStatesAfterSwap(
        possibleMoves,
        state
      );
      //looping through the generated puzzle states.
      for (let i = 0; i < puzzles.length; i++) {
        //if the configuration has already been played, it will not get played again. Otherwise add the states to the queue and visited set & selected indices in the finalMoves array.
        if (!visited.has(puzzles[i].toString())) {
          queue.push({ state: puzzles[i] });
          visited.add(puzzles[i].toString());
          finalMoves.push(selectedIndices[i]);
        }
      }
    }
    //if returned null, it means the puzzle is unsolvable
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

    //up
    if (currentEmpty - size >= 0) {
      elements.push(currentEmpty - size);
    }
    //right
    if (currentEmpty % size !== 3 && currentEmpty + 1 <= 15) {
      elements.push(currentEmpty + 1);
    }
    //bottom
    if (currentEmpty + size <= 15) {
      elements.push(currentEmpty + size);
    }
    //left
    if (currentEmpty - 1 >= 0 && (currentEmpty - 1) % size !== 3) {
      elements.push(currentEmpty - 1);
    }
    shuffle(elements); //randomly make the moves if valid
    return elements;
  };

  /*
  This is the function that I'm using now.
  It moves to the next valid position if it's configuration hasn't been played yet. Even though, it will take a lot of moves to solve the puzzle, it is guardranteed that it will not increase the
  time complexity.
  */

  const generateNextMove = (tiles) => {
    visited.add(tiles.toString()); //add initial state of the puzzle to the visited set.

    //if solved, it will not return any move.
    if (isSolved(tiles)) {
      return null;
    }

    let arr = [...tiles];
    let currentEmpty = arr.indexOf(null); //finding the current empty index
    let moves = getPossibleMoves(currentEmpty, 4); //finding the possible moves

    //looping through the moves
    for (let move of moves) {
      let myArr = [...arr];
      let tileMove = tileClick(myArr, myArr[move]); //possible puzzle after the move gets played

      //if the move hasn't been visited before, add it to the visited set, set the puzzle(setTiles) with the obtained configuration and return the move.
      if (!visited.has(myArr.toString())) {
        visited.add(myArr.toString());
        console.log("Sets the tiles: ", visited);
        setVisited(visited);
        setTiles([...myArr]);
        return move;
      }
    }
    return null;
  };

  //this function checks if the current board configuration is solvable.

  function isSolvable(tiles) {
    const width = 4;
    let inversions = 0;
    let blankRow = 0; //row at which blank tile is present
    let row = 0; // row number


    //count the no of inversions(wrongly ordered elements)
    for (let i = 0; i < tiles.length - 1; i++) {
      if(i % width === 0) {
        row++;
      }
      if (tiles[i] === null) {
        blankRow = row;
        continue;
      } // Skip the empty tile
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[j] !== null && tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }

    //if board is even(4x4), the blank cell on the even row from top and no of inversions is even, the board becomes solvable
    //otherwise, if blank cell is on the odd row from top, no of inversions should be odd.
    
    //For odd board, the no of inversions must be even
    if(width % 2 === 0) {
      if(blankRow % 2 === 0) {
        return inversions % 2 === 0;
      }
      else {
        return inversions % 2 !== 0;
      }
    }
    else {
      return inversions % 2 === 0;
    }
  }

  //this useeffect calls the function to check if the tiles are solvable. The portion commented out also checks for solvable board by using the alternative function.
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
        {/*Adding PLAY, PAUSED overlay*/}
        <Overlay
          visibility={isReset || isPaused}
          isPaused={isPaused}
          isReset={isReset}
          setIsReset={setIsReset}
          setIsPaused={setIsPaused}
        />
              {/*Creating tiles from the list*/}
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
            {/*Start/Pause Button*/}
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

            {/*If solvable, show the help button*/}

        {solvable && (
          <button
            className="btn-style"
            onClick={() => {
              //this portion will generate the next move for the puzzle. The portion commented out will take alternative approach which will play a move from the finalMoves list.
              
              if (!isReset && !isPaused && solvable && !isSolved(tiles)) {
                
                // let move = finalMoves.shift();
                // tileClick(tiles, tiles[move]);
                // setTiles([...tiles]);

                let move = generateNextMove(tiles);
                tileClick(tiles, tiles[move]);
                countMoves++; //count of moves increases
                setCountMoves(countMoves);
                setTiles([...tiles]);
              }
            }}
          >
            Help
          </button>
        )}

            {/*Reset button will reset the tiles to the solved state and then shuffle the elements again. This is done in order to give the similar functionality as mentioned in the example puzzle website.*/}
        <button
          className="btn-style"
          onClick={() => {
            setIsReset(true);
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
              setVisited(new Set());
            }, 1000);
          }}
        >
          Reset
        </button>
      </div>
      <div className="btn-div">
        <div className="stop-div">
                        {/*Moves*/}
          <h3>MOVES</h3>
          <p>{isSolved(tiles) && !isReset && !isPaused ? countMoves : "0"}</p>
        </div>
                        {/*Stopwatch*/}
        <Stopwatch isReset={isReset} isPaused={isPaused} />
      </div>
                      {/*Unsolvable puzzles give this message*/}
      <p>{solvable ? "" : "Unsolvable"}</p>
    </div>
  );
}
