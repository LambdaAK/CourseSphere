import { useState } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ReactCardFlip from 'react-card-flip';


export default function ProfessorCard(props: ProfessorCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => {setIsFlipped(!isFlipped);};
  const { name, title, departments, imageUrl, email, phone, education, reviews } = props;

  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
      <Card style={{ maxWidth: 345, margin: '20px auto' }} onClick={handleFlip}>
        <CardMedia component="img" height="140" image={imageUrl} alt={name}/>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">{name}</Typography>
          <Typography variant="body2" color="textSecondary" component="p">{title}</Typography>
          <Typography variant="body2" color="textSecondary" component="p">{departments}</Typography>
          <Typography variant="body2" color="textSecondary" component="p">Email: {email}</Typography>
          <Typography variant="body2" color="textSecondary" component="p">Phone: {phone}</Typography>
          <Typography variant="body2" color="textSecondary" component="p">Education: {education}</Typography>
        </CardContent>
      </Card>

      <Card style={{ maxWidth: 345, margin: '20px auto' }} onClick={handleFlip}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">Reviews</Typography>
          {reviews.map((review, index) => (
            <Typography key={index} variant="body2" color="textSecondary" component="p">
              {review}
            </Typography>
          ))}
        </CardContent>
      </Card>
    </ReactCardFlip>
  );
}
