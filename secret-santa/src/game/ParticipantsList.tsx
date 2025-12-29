import { For } from 'solid-js';
import type { Participant } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Box, List, ListItem, ListItemText, ListItemSecondaryAction, Chip } from '@suid/material';

interface ParticipantsListProps {
  participants: Participant[];
  isCreator?: boolean;
  onRemoveParticipant?: (participantId: string) => void;
}

const ParticipantsList = (props: ParticipantsListProps) => {
  return (
    <Card>
      <Box p={3}>
        {props.participants.length > 0 ? (
          <List>
            <For each={props.participants}>
              {(participant) => (
                <ListItem>
                  <ListItemText
                    primary={participant.name}
                    secondary={participant.email}
                  />
                  {participant.isCreator && (
                    <Chip
                      label="Creator"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {props.isCreator && participant.id && !participant.isCreator && (
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => props.onRemoveParticipant?.(participant.id)}
                      >
                        Remove
                      </Button>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              )}
            </For>
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <ListItemText
              primary="No participants yet"
              secondary="Be the first to join this game!"
            />
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default ParticipantsList;