interface Props {
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const Timer = ({ timeLeft, formatTime }: Props) => {
  return (
    <div className="timer">
      Time Left: {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;
