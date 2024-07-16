import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ReactCardFlip from 'react-card-flip';


export default function CourseCard(props: CourseCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => {setIsFlipped(!isFlipped);};
  const { name, type, sectionNumber, location, days, time, dates, instructor, reviews } = props;

  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
      <Card style={{ maxWidth: 345, margin: '20px auto' }} onClick={handleFlip}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div"> {name} </Typography>
          <Typography variant="body2" color="textSecondary" component="p"> Type: {type} </Typography>
          <Typography variant="body2" color="textSecondary" component="p"> Section: {sectionNumber} </Typography>
          <Typography variant="body2" color="textSecondary" component="p"> Location: {location} </Typography>
          <Typography variant="body2" color="textSecondary" component="p"> Days: {days} </Typography>
          <Typography variant="body2" color="textSecondary" component="p"> Time: {time} </Typography>
          <Typography variant="body2" color="textSecondary" component="p"> Dates: {dates} </Typography>
          <Typography variant="body2" color="textSecondary" component="p"> Instructor: {instructor} </Typography>
        </CardContent>
      </Card>

      <Card style={{ maxWidth: 345, margin: '20px auto' }} onClick={handleFlip}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div"> Reviews </Typography>
          {reviews.map((review, index) => ( 
            <Typography key={index} variant="body2" color="textSecondary" component="p"> {review}</Typography>
          ))}
        </CardContent>
      </Card>
    </ReactCardFlip>
  );
}