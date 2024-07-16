import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CourseCard from '../CourseCard/CourseCard';
import ProfessorCard from '../ProfessorCard/ProfessorCard';


interface CardDeckProps {
  cards: (CourseRecommendation | ProfessorRecommendation)[];
}

const CardDeck: React.FC<CardDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
    setFlipped(false); // Reset flip state when navigating
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
    setFlipped(false); // Reset flip state when navigating
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const currentCard = cards[currentIndex];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePrev} disabled={cards.length <= 1}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ mx: 2, position: 'relative' }} onClick={handleFlip}>
          {currentCard.type === 'course' && <CourseCard {...currentCard.data} />}
          {currentCard.type === 'professor' && <ProfessorCard {...currentCard.data} />}
        </Box>
        <IconButton onClick={handleNext} disabled={cards.length <= 1}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CardDeck;
