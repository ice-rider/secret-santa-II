import { createSignal, onMount } from 'solid-js';

interface AssignmentRevealProps {
  gameId: string;
}

interface Assignment {
  id: string;
  name: string;
  email: string;
  wishList?: string;
}

const AssignmentReveal = (_props: AssignmentRevealProps) => {
  const [assignment, setAssignment] = createSignal<Assignment | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [revealed, setRevealed] = createSignal(false);

  onMount(async () => {
    try {
      setLoading(true);
      setError('');
      // In a real implementation, we would fetch the assignment for the current user in this game
      // For now, we'll just initialize with null and let the user reveal it
    } catch (err) {
      setError('Failed to load assignment');
      console.error('Error loading assignment:', err);
    } finally {
      setLoading(false);
    }
  });

  const revealAssignment = async () => {
    try {
      setLoading(true);
      setError('');
      // In a real implementation, we would call an API to reveal the assignment
      // For demo purposes, we'll create a mock assignment
      const mockAssignment: Assignment = {
        id: 'mock-assignee-id',
        name: 'Jane Doe',
        email: 'jane@example.com',
        wishList: 'I would love a new book, a cozy sweater, or a nice coffee mug'
      };
      setAssignment(mockAssignment);
      setRevealed(true);
    } catch (err) {
      setError('Failed to reveal assignment');
      console.error('Error revealing assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading()) {
    return <div class="loading">Loading assignment...</div>;
  }

  if (error()) {
    return <div class="error-message">{error()}</div>;
  }

  return (
    <div class="assignment-reveal">
      {!revealed() ? (
        <div class="reveal-prompt">
          <p>Your Secret Santa assignment is waiting for you!</p>
          <button 
            class="reveal-btn" 
            onClick={revealAssignment}
            disabled={loading()}
          >
            {loading() ? 'Revealing...' : 'Reveal Assignment'}
          </button>
        </div>
      ) : assignment() ? (
        <div class="assignment-details">
          <h4>You are assigned to: <span class="assignee-name">{assignment()?.name}</span></h4>
          
          {assignment()?.email && (
            <div class="assignee-contact">
              <p><strong>Email:</strong> {assignment()?.email}</p>
            </div>
          )}
          
          {assignment()?.wishList && (
            <div class="assignee-wishes">
              <h5>Wish List:</h5>
              <p>{assignment()?.wishList}</p>
            </div>
          )}
          
          <div class="assignment-actions">
            <button 
              class="new-reveal-btn"
              onClick={() => {
                setRevealed(false);
                setAssignment(null);
              }}
            >
              Hide Assignment
            </button>
          </div>
        </div>
      ) : (
        <p>No assignment found. The game may not be started yet.</p>
      )}
    </div>
  );
};

export default AssignmentReveal;