// A file defining interfaces used in the frontend //



interface ProfessorCardProps {
  name: string;
  title: string;
  departments: string;
  imageUrl: string;
  email: string;
  phone: string;
  education: string;
  reviews: string[]; 
}

interface CourseCardProps {
  name: string;
  type: string;
  sectionNumber: string;
  location: string;
  days: string;
  time: string;
  dates: string;
  instructor: string;
  reviews: string[];
}


interface CourseRecommendation {
  type: 'course';
  data: {
    name: string;
    type: string;
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



interface Chat {
  title: string;
  timestamp: string;
}

type Recommendation = CourseRecommendation | ProfessorRecommendation;
