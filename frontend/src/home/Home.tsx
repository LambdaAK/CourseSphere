import {Container, Paper, TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Home = () => {
  return (
    <Container maxWidth="md" className="home" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <img
        src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png"
        alt="Google"
        style={{ marginBottom: '20px' }}
      />
      <Paper
        component="form"
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
          p: '2px 4px',
          boxShadow: 3,
          borderRadius: '24px',
        }}
      >
        <TextField
          variant="standard"
          placeholder="Search Google or type a URL"
          sx={{ ml: 1, flex: 1, '& .MuiInputBase-root': { p: '10px' } }}
          InputProps={{ disableUnderline: true }}
        />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
    </Container>
  );
}

export default Home;
