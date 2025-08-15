import type{ ApiQuestion } from "../Test";
import Timer from './Timer'; // <--- Import the new Timer component

interface Props {
  questions: ApiQuestion[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  answeredCount: number;
  timeLeft: number;
  formatTime: (s: number) => string;
  setShowConfirmModal: (v: boolean) => void;
}

const Sidebar = ({
  questions,
  currentIndex,
  setCurrentIndex,
  answeredCount,
  timeLeft,
  formatTime,
  setShowConfirmModal,
}: Props) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Timer timeLeft={timeLeft} formatTime={formatTime} /> {/* Use Timer component */}
        <div className="progress">
          Answered: {answeredCount} / {questions.length}
        </div>
      </div>

      <div className="question-nav">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;

          const firstUnansweredIndex = questions.findIndex(
            (q) => q.status === 'not_visited'
          );

          const allAttempted = questions.every(
            (q) => q.status === 'answered' || q.status === 'skipped'
          );

          const allow =
            allAttempted ||
            isCurrent ||
            idx <= firstUnansweredIndex ||
            (idx < currentIndex &&
              (questions[idx].status === 'answered' || questions[idx].status === 'skipped'));

          return (
            <div
              key={q.id}
              className={`question-number ${q.status} ${isCurrent ? 'active' : ''} ${!allow ? 'no-pointer disabled' : ''}`}
              onClick={() => allow && setCurrentIndex(idx)}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {questions.length > 0 &&
        questions.every((q) => q.status === 'answered' || q.status === 'skipped') && (
          <button
            className="submit-button"
            style={{ marginTop: '20px' }}
            onClick={() => setShowConfirmModal(true)}
          >
            Submit Test
          </button>
        )}
    </div>
  );
};

export default Sidebar;
