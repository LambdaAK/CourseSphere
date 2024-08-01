import ChatInterface from '../../components/ChatInterface/ChatInterface';
import UserChats from '../../components/UserChats/UserChats';
import './Home.css'

export default function Home() {
  return (
    <section className="home">
      <div className="user-chats-container">
        <UserChats/>
      </div>
      <div className="chat-interface-container">
        <ChatInterface />
      </div>
    </section>
  );
}
