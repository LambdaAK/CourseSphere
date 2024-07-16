import ChatInterface from '../../components/ChatInterface/ChatInterface';
import UserChats from '../../components/UserChats/UserChats';
import './Home.css'

const sampleChats = [
  { title: 'CS 1110 Info', timestamp: 'Today' },
  { title: 'Math 2940 Prof', timestamp: 'Yesterday' },
  { title: 'Physics 2213 Syllabus', timestamp: 'Last 7 days' },
  { title: 'Chem 2070 Exam Details', timestamp: 'Last month' },
];

export default function Home() {
  return (
    <section className="home">
      <div className="user-chats-container">
        <UserChats chats={sampleChats} />
      </div>
      <div className="chat-interface-container">
        <ChatInterface />
      </div>
    </section>
  );
}
