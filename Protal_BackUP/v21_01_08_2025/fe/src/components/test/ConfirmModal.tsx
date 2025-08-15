import "../css/ConfirmModal.css"

interface ConfirmModalProps {
  answeredCount: number;
  totalQuestions: number;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const ConfirmModal = ({
  answeredCount,
  totalQuestions,
  onCancel,
  onConfirm,
  isSubmitting
}: ConfirmModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h3>Confirm Submission</h3>
        <p>
          You have answered <strong>{answeredCount}</strong> out of{' '}
          <strong>{totalQuestions}</strong> questions.
        </p>
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onCancel} disabled={isSubmitting}>
            Go Back
          </button>
          <button className="confirm-btn" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
