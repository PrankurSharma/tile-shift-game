import { useEffect, useState } from "react";

export default function Stopwatch({ isReset, isPaused }) {
  let [mins, setMins] = useState("00");
  let [seconds, setSeconds] = useState("00");

  useEffect(() => {
    let interval;
    if (!isReset) {
      interval = setInterval(() => {
        if (seconds < 59) {
          seconds++;
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
        } else if (seconds === 59) {
          mins++;
          if (mins < 10) {
            mins = "0" + mins;
          }
          seconds = "00";
        }
        setMins(mins);
        setSeconds(seconds);
      }, 1000);
    } else {
      mins = "00";
      seconds = "00";
      setMins(mins);
      setSeconds("00");
    }
    if (isPaused) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isReset, isPaused]);
  return (
    <div className="stop-div">
      <h3>TIME</h3>
      <p>
        <span>{mins}</span>
        <span>:</span>
        <span>{seconds}</span>
      </p>
    </div>
  );
}
