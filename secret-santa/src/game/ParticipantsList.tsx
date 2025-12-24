import { For } from 'solid-js';

interface Participant {
  id: string;
  name: string;
  email: string;
  isCreator?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  isCreator: boolean;
  onRemoveParticipant?: (participantId: string) => void;
}

const ParticipantsList = (props: ParticipantsListProps) => {
  return (
    <div class="participants-list">
      {props.participants.length > 0 ? (
        <ul class="participants-grid">
          <For each={props.participants}>
            {(participant) => (
              <li class={`participant-item ${participant.isCreator ? 'creator' : ''}`}>
                <div class="participant-info">
                  <span class="participant-name">{participant.name}</span>
                  {participant.isCreator && (
                    <span class="creator-badge">Creator</span>
                  )}
                </div>
                {props.isCreator && participant.id && !participant.isCreator && (
                  <button
                    class="remove-participant-btn"
                    onClick={() => props.onRemoveParticipant?.(participant.id)}
                    title={`Remove ${participant.name}`}
                  >
                    &times;
                  </button>
                )}
              </li>
            )}
          </For>
        </ul>
      ) : (
        <p class="no-participants">No participants yet. Be the first to join!</p>
      )}
    </div>
  );
};

export default ParticipantsList;