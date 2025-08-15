const Instructions = () => {
  return (
    <>
      <div className="instructions">
        <h2>Instructions</h2>
        <ul>
          <li>Do not switch tabs or exit fullscreen.</li>
          <li>Test auto-submits after 45 minutes.</li>
          <li>Each question must be answered or skipped.</li>
        </ul>
        <button className="submit-button" onClick={()=>{}}>
          I agree
        </button>
      </div>
    </>
  );
};

export default Instructions;
