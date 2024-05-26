import { useEffect } from "react";

export default function Overlay({
  visibility,
  isReset,
  isPaused,
  setIsReset,
  setIsPaused,
}) {
  useEffect(() => {
    document.getElementsByClassName("overlay")[0].style.visibility = visibility
      ? "visible"
      : "hidden";
  }, [isReset, isPaused]);
  return (
    <div
      className="overlay"
      onClick={() => {
        setIsReset(false);
        setIsPaused(false);
      }}
    >
      {isPaused ? "PAUSED" : "PLAY"}
    </div>
  );
}
