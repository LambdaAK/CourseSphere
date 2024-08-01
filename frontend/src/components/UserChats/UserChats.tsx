import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { toast } from 'react-toastify';
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseConfig";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export default function UserChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsLoggedIn(true);
          try {
            const idToken = await user.getIdToken();
            const response = await fetch("http://127.0.0.1:5000/theactualbackendlink", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setChats(data.chats); 
            toast.success("Successfully fetched your chats!");
          } catch (error) {
            toast.error(`Failed to fetch your chats: ${error}`);
          }
        } else {
          setIsLoggedIn(false);
        }
        setLoading(false);
      });
    };

    fetchChats();
  }, []);

  return (
    <>
      <Typography variant="h6" sx={{ textAlign: 'center', margin: '1em 0' }}>Previous Chats</Typography>
      {loading ? (
        <Typography variant="body2" sx={{ padding: '1em', textAlign: 'center', color: '#888' }}>Loading...</Typography>
      ) : !isLoggedIn ? (
        <Typography variant="body2" sx={{ padding: '1em', textAlign: 'center', color: '#888' }}>You are not logged in.</Typography>
      ) : chats.length === 0 ? (
        <Typography variant="body2" sx={{ padding: '1em', textAlign: 'center', color: '#888' }}>You have no saved chats.</Typography>
      ) : (
        <List sx={{ backgroundColor: '#f0f0f0', fontSize: '0.9em' }}>
          {chats.map((chat, index) => (
            <ListItem key={index} sx={{ '&:hover': { backgroundColor: '#d0d0d0', cursor: 'pointer' } }}>
              <ListItemText primary={chat.title} secondary={chat.timestamp} />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
