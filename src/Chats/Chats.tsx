import React, { useState, useEffect, useRef } from "react";
import "./Chats.css";

interface Props {
  userResponse: string;
  botResponse: {
    purpose: string;
    message: string;
    options?: string[];
    sender: string;
  };
  sendUserResponse: string;
  optionClick: (ev: React.MouseEvent<HTMLElement>) => void;
}

interface MessagesInfo {
  purpose?: string;
  message: string;
  options?: string[];
  sender: string;
}

const intro_text = `Sing to me Muse of the Odyssey untold, of one of the many Greeks who on his way from that wasteland of Troy too encountered adventure
He who witnessed Aphrodite steal from fair death her favored Paris, and too saw might Ares descend into battle. 
Who scaled the walls of Troy, sacking that once so glorious city before beginning his journey home.
But tell me brave hero, do you plan to return home or else to make sacrifies to the gods?
`


const Chats: React.FC<Props> = props => {
  const [messages, setMessages] = useState<MessagesInfo[]>([]);
  const dummyRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // const userMessages = props.userResponse;
  const botMessages = props.botResponse;
  const userMessages = props.sendUserResponse

  // stacking up messages
  useEffect(() => {
    if (messages.length === 0) {

      const allIntroMessages = intro_text.split("\n").filter((msg) => msg.trim().length).map((msg) => {
        return {
          purpose: "introduction",
          message: msg, 
          sender: "bot"
        }
      })
      setMessages(allIntroMessages);
    } else {
      let tempArray = [...messages];
      tempArray.push({ message: props.sendUserResponse, sender: "user" });
      setMessages(tempArray);

      setTimeout(() => {
        let temp2 = [...tempArray];
        temp2.push(props.botResponse);
        setMessages(temp2);
      }, 1000);
    }
  }, [userMessages, botMessages]); // I think this error is wrong

  // enable autoscroll after each message except for the intro
  useEffect(() => {
    if (dummyRef && dummyRef.current && bodyRef && bodyRef.current && messages.filter((msg) => msg.sender === "user").length) {
      bodyRef.current.scrollTo({
        top: dummyRef.current.offsetTop,
        behavior: "smooth"
      });
    }
  }, [messages]);

  return (
    <div className="message-container" ref={bodyRef}>
      {messages.map(chat => (
        <div key={chat.message}>
          <div className={`message ${chat.sender}`}>
            <p>{chat.message}</p>
          </div>
          {chat.options ? (
            <div className="options">
              <div>
                <i className="far fa-hand-pointer"></i>
              </div>
              {chat.options.map(option => (
                <p
                  onClick={e => props.optionClick(e)}
                  data-id={option}
                  key={option}
                >
                  {option}
                </p>
              ))}
            </div>
          ) : null}
          <div ref={dummyRef} className="dummy-div"></div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
