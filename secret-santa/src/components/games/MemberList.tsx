// frontend/src/components/games/MemberList.tsx
import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Person as PersonIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { UserProfile } from '../../lib/api/game';

interface MemberListProps {
  members: UserProfile[];
  isAdmin?: boolean;
  currentUserId?: number;
  onRemoveMember?: (userId: number) => void;
}

const MemberList: React.FC<MemberListProps> = ({ 
  members, 
  isAdmin = false, 
  currentUserId,
  onRemoveMember 
}) => {
  return (
    <List>
      {members.map((member) => (
        <ListItem
          key={member.id}
          secondaryAction={
            isAdmin && 
            member.id !== currentUserId && 
            onRemoveMember && (
              <Tooltip title="Remove member">
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onRemoveMember && onRemoveMember(member.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )
          }
        >
          <ListItemAvatar>
            <Avatar>
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} />
              ) : (
                <PersonIcon />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={member.name}
            secondary={
              member.id === currentUserId && (
                <Chip label="You" size="small" color="primary" />
              )
            }
          />
        </ListItem>
      ))}
      {(!members || members.length === 0) && (
        <ListItem>
          <ListItemText
            primary="No members yet"
            secondary="Be the first to join this game!"
          />
        </ListItem>
      )}
    </List>
  );
};

export default MemberList;