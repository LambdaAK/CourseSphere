import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { Paper, IconButton, Box, Typography, Container, InputBase, Collapse } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CardDeck from '../DeckOfCards/CardDeck';
import './ChatInterface.scss';

interface Response {
  user?: string;
  bot?: string;
}

export default function ChatInterface() {
  const [query, setQuery] = useState<string>('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [recommendations, setRecommendations] = useState<(CourseRecommendation | ProfessorRecommendation)[]>([]);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat window on initial load and when responses change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [responses, recommendations]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim() === '') return;

    // Echo user message
    const newResponses: Response[] = [...responses, { user: query }];

    try {
      const { botResponse, newRecommendations } = await fetchBotResponseAndRecommendations(query);
      const updatedResponses: Response[] = [...newResponses, { bot: botResponse }];
      setResponses(updatedResponses);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error fetching bot response:', error);
    }

    setQuery('');
  };

  const fetchBotResponseAndRecommendations = async (query: string) => {
    // Placeholder logic for fetching bot response and recommendations
    const botResponse = `"${query}"`;
    let newRecommendations: (CourseRecommendation | ProfessorRecommendation)[] = [];

    if (query.toLowerCase().includes('course')) {
      newRecommendations = [
        {
          type: 'course',
          data: {
            name: 'CS 1110',
            type: 'Lecture',
            sectionNumber: '1',
            location: 'Online',
            days: 'MWF',
            time: '10:00 AM - 11:00 AM',
            dates: '08/23/2023 - 12/09/2023',
            instructor: 'Prof. John Doe',
            reviews: ['Great course!', 'Learned a lot.']
          }
        },
        {
          type: 'course',
          data: {
            name: 'MATH 3110',
            type: 'Lecture',
            sectionNumber: '1',
            location: 'Online',
            days: 'MWF',
            time: '10:00 AM - 11:00 AM',
            dates: '08/23/2023 - 12/09/2023',
            instructor: 'Prof. ROBERT',
            reviews: ['NO!', 'NAHat.']
          }
        }
      ];
    } else if (new RegExp('teacher|professor').test(query.toLowerCase())) {
      newRecommendations = [
        {
          type: 'professor',
          data: {
            name: 'Prof. Jane Smith',
            title: 'Associate Professor',
            departments: 'Computer Science',
            imageUrl: 'https://via.placeholder.com/150',
            email: 'jane.smith@university.edu',
            phone: '123-456-7890',
            education: 'PhD in Computer Science',
            reviews: ['Very knowledgeable.', 'Great teaching style.']
          }
        },
        {
          type: 'professor',
          data: {
            name: 'Prof. ARTHURT Smith',
            title: 'Associate Professor',
            departments: 'Computer Science',
            imageUrl: 'https://via.placeholder.com/150',
            email: 'jane.smith@university.edu',
            phone: '123-456-7890',
            education: 'PhD in Computer Science',
            reviews: ['Very knowledgeable.', 'Great teaching style.']
          }
        }
      ];
    }

    return { botResponse, newRecommendations };
  };

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
      <strong>
        TODO: MAKE THIS SO IT FUNCTIONS LIKE CHATGPT'S Search, where it grows in size depending on text input size and introduces a scrollbar if needed.</strong>
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
                  <Typography variant="body1" sx={{ borderRadius: "15px", padding: "5px", paddingLeft: "15px", paddingRight: "15px", backgroundColor: res.user ? '#34b1eb' : '#71757a'}}>{res.user || res.bot}</Typography>
                </Box>
              </Box>

              {res.bot && recommendations.length > 0 && (
                <Box
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
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          boxShadow: 3,
          borderRadius: '20px',
          width: '100%',
          paddingLeft: '10px',
          paddingRight: '10px',
          display: 'flex',
          alignItems: 'center',
          mt: 2, // Add margin to position search bar underneath chat window
        }}
        onSubmit={handleSubmit}
      >
        <InputBase
          placeholder="Ask CourseSphere anything..."
          contentEditable="true"
          fullWidth={true}
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          sx={{
            ml: 1,
            flex: 1,
            borderRadius: '20px',
            padding: '10px',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            borderWidth: '110px',
            boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)',
            overflowY: 'auto', // Add vertical scrollbar if needed
            maxHeight: '100px', // Max height before scrolling
            width: '100%',
          }}
          inputProps={{
            'aria-label': 'type message',
          }}
        />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="send">
          <SearchIcon />
        </IconButton>
      </Paper>
    </Container>
  );
}
