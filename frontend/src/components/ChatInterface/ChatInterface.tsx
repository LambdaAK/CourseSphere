import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { IconButton, Box, Typography, Container, InputBase, Collapse } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CardDeck from '../DeckOfCards/CardDeck';
import { fetchCourseSphereResponse, saveCourseSphereChat, h} from "../../api";
import './ChatInterface.scss';



interface Response {
  user?: string;
  bot?: string;
}


const BATCH_SIZE = 5;  

export default function ChatInterface() {
  const [query, setQuery] = useState<string>('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [recommendations, setRecommendations] = useState<(CourseRecommendation | ProfessorRecommendation)[]>([]);
  const [batch, setBatch] = useState<Message[]>([]);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [responses, recommendations]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (batch.length > 0) {
        const chatId = "someUniqueChatId";  // Replace with appropriate chatId
        await saveCourseSphereChat(chatId, batch);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [batch]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim() === '') return;

    const newResponses: Response[] = [...responses, { user: query }];
    const userMessage: Message = {
      sender: 'user',
      content: query,
      messageID: h(query),
      timestamp: new Date().toISOString(),
    };

    try {
      const { botResponse, newRecommendations } = await fetchCourseSphereResponse(query);
      const botMessage: Message = {
        sender: 'bot',
        content: { botResponse, newRecommendations },
        messageID: h({botResponse, newRecommendations}),
        timestamp: new Date().toISOString(),
      };

      const updatedResponses: Response[] = [...newResponses, { bot: botResponse }];
      setResponses(updatedResponses);
      setRecommendations(newRecommendations);

      const newBatch = [...batch, userMessage, botMessage];
      setBatch(newBatch);

      if (newBatch.length >= BATCH_SIZE) { 
        const chatId = "someUniqueChatId";  
        await saveCourseSphereChat(chatId, newBatch);
        setBatch([]);
      }
    } catch (error) {
      console.error('Error fetching bot response:', error);
    }
    setQuery('');
  };

  const determineChatClassName = (user: string | undefined) => {
    return user ? "user-response" : "bot-response";
  };
  return (
    <Container maxWidth="md" sx={{ display: 'flex',   flexDirection: 'column', alignItems: 'center', mt: 1 }}>-
      <Box
        sx={{
          p: 2,
          width: '100%',
          bgcolor: '#f0f0f0',
          borderRadius: '16px',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            CourseSphere
          </Typography>
        </Box>
        <Box ref={chatWindowRef} className="chat-window">
          {responses.map((res, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: res.user ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box sx={{display: 'flex', justifyContent: res.user ? 'flex-end' : 'flex-start' }}>
                <Box
                  className={`shared ${res.user ? 'sent' : 'received'} ${
                    index > 0 && responses[index - 1].user === res.user ? 'noTail' : ''
                  }`}
                >
                  <Typography variant="caption" sx={{ color: res.user ? 'black' : 'gray', mb: 1 }}>
                    {res.user ? 'You' : 'CourseSphere'}
                  </Typography>
                  <Typography className={determineChatClassName(res.user)} variant="body1" sx={{ borderRadius: "15px", padding: "5px", paddingLeft: "15px", paddingRight: "15px", backgroundColor: res.user ? '#34b1eb' : '#71757a'}}>{res.user || res.bot}</Typography>
                </Box>
              </Box>

              {res.bot && recommendations.length > 0 && (
                <Box className= {"bot-courses"}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    mt: 1,
                  }}
                >
                  <Collapse in={true} sx={{ mb: 2 }}>
                    <CardDeck cards={recommendations} />
                  </Collapse>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        component="form"
        sx={{
          boxShadow: 3,
          borderRadius: '20px',
          width: '100%',
          paddingLeft: '10px',
          paddingRight: '10px',
          display: 'flex',
          alignItems: 'center',
          mt: 2,
          marginBottom: '20px'
        }}
        onKeyDown={e => {
          if (e.key === "Enter") {
              handleSubmit(e);
          }
        }}
        onSubmit={handleSubmit}
      >
        <InputBase
          placeholder="Ask CourseSphere anything..."
          contentEditable="true"
          multiline={true}
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          sx={{
            ml: 1,
            flex: 1,
            borderRadius: '20px',
            padding: '15px',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            overflowY: 'auto', 
            maxHeight: '100px', 
            width: '100%',
          }}
          inputProps={{
            'aria-label': 'type message',
          }}
        />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="send">
          <SearchIcon />
        </IconButton>
      </Box>
    </Container>
  );
}
