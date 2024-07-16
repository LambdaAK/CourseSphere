import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { Paper, TextField, IconButton, Box, Typography, Collapse, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CourseCard from '../CourseCard/CourseCard';
import ProfessorCard from '../ProfessorCard/ProfessorCard';

interface Response {
  user?: string;
  bot?: string;
}

interface CourseRecommendation {
  type: 'course';
  data: {
    name: string;
    type: string;
    sectionNumber: string;
    location: string;
    days: string;
    time: string;
    dates: string;
    instructor: string;
    reviews: string[];
  };
}

interface ProfessorRecommendation {
  type: 'professor';
  data: {
    name: string;
    title: string;
    departments: string;
    imageUrl: string;
    email: string;
    phone: string;
    education: string;
    reviews: string[];
  };
}

const ChatInterface: React.FC = () => {
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

    if (query.toLowerCase().includes('courses')) {
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
        }
      ];
    } else if (query.toLowerCase().includes('teachers')) {
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
        }
      ];
    }

    return { botResponse, newRecommendations };
  };

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Box sx={{ p: 2, width: '100%', bgcolor: '#f0f0f0', borderRadius: '16px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ width: '100%', mb: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>CourseSphere</Typography>
        </Box>

        <Box ref={chatWindowRef} sx={{ width: '100%', maxHeight: '60vh', overflowY: 'auto', flexGrow: 1 }}>
          {responses.map((res, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: res.user ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: res.user ? 'flex-end' : 'flex-start' }}>
                <Box sx={{
                  maxWidth: '70%',
                  minWidth: '20%',
                  p: 2,
                  borderRadius: '12px',
                  alignSelf: res.user ? 'flex-end' : 'flex-start',
                  bgcolor: res.user ? '#1976d2' : 'white',
                  color: res.user ? 'white' : 'black',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  textAlign: 'left',
                  fontSize: '15px',
                }}>
                  <Typography variant="caption" sx={{ color: res.user ? 'white' : 'gray', mb: 1 }}>{res.user ? 'You' : 'Course Sphere'}</Typography>
                  <Typography variant="body1">{res.user || res.bot}</Typography>
                </Box>
              </Box>
              {res.bot && recommendations.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', mt: 1 }}>
                  {recommendations.map((rec, recIndex) => (
                    <Collapse key={recIndex} in={true} sx={{ mb: 2 }}>
                      {rec.type === 'course' && <CourseCard {...rec.data} />}
                      {rec.type === 'professor' && <ProfessorCard {...rec.data} />}
                    </Collapse>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
        <Paper component="form" sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          p: '2px 4px',
          boxShadow: 3,
          borderRadius: '24px',
          mt: 2,
        }} onSubmit={handleSubmit}>
          <TextField variant="standard" placeholder="Type your message"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            sx={{ ml: 1, flex: 1, borderRadius: '24px', '& .MuiInputBase-root': { p: '10px' } }}
            InputProps={{ disableUnderline: true }}
          />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="send">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatInterface;
