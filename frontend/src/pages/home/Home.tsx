import { Container } from '@mui/material';
import ChatInterface from '../../components/ChatInterface/ChatInterface';

export default function Home() {
  return (
    <Container maxWidth="md" className="home" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <img
        src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png"
        alt="Google"
        style={{ marginBottom: '20px' }}
      />
      <ChatInterface />
    </Container>
  );
}
