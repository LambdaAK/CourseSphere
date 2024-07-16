import React, { useState } from 'react';
import { List, ListItem, ListItemText, Drawer} from '@mui/material';
//drawer for modal window to show chats on mobile liek chatgpt, someone else can do that

interface Chat {
  title: string;
  timestamp: string;
}

const UserChats: React.FC<{ chats: Chat[] }> = ({ chats }) => {
  
  return (
    <List sx={{ backgroundColor: '#f0f0f0', fontSize: '0.9em' }}>
        {chats.map((chat, index) => (
          <ListItem key={index} sx={{ '&:hover': { backgroundColor: '#d0d0d0', cursor: 'pointer'  } }}>
            <ListItemText primary={chat.title} secondary={chat.timestamp} />
          </ListItem>
        ))}
    </List>
  );
};

export default UserChats;
