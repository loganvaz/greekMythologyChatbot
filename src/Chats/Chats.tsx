import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import {MessagesInfo} from "../interfaces";
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
  messages: MessagesInfo[];
  setMessages: Dispatch<SetStateAction<MessagesInfo[]>>;
}



const intro_text = `Sing to me Muse of the Odyssey untold, of one of the many Greeks who on his way from that wasteland of Troy too encountered adventure
He who witnessed Aphrodite steal from fair death her favored Paris, and too saw might Ares descend into battle. 
Who scaled the walls of Troy, sacking that once so glorious city before beginning his journey home.
But tell me brave hero, do you plan to return home or else to make sacrifies to the gods?
`

export const allIntroMessages = intro_text.split("\n").filter((msg) => msg.trim().length).map((msg) => {
  return {
    purpose: "introduction",
    message: msg, 
    sender: "bot"
  }
})


const Chats: React.FC<Props> = props => {
  // const [messages, setMessages] = useState<MessagesInfo[]>(props.messages);
  const dummyRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // const userMessages = props.userResponse;
  const botMessages = props.botResponse;
  const userMessages = props.sendUserResponse

  // useEffect(() => {
  //   console.log("using onMsgChange to " + messages);
  //   // props.onMsgChange(messages);
  // }, [messages]);

  // stacking up messages


  useEffect(() => {
    console.log("MESSAGES IN CHATS is ", props.messages);
    if (props.messages.length === 0) {
      props.setMessages(allIntroMessages);
    } else {
      const lastMsg = props.messages[props.messages.length-1].message.trim();
      if (props.sendUserResponse.trim() === lastMsg) return;
      console.log("adding user response of ", props.sendUserResponse, "last msg is ", lastMsg, "equality is ", lastMsg === props.sendUserResponse);
      let tempArray = [...props.messages];
      tempArray.push({ message: props.sendUserResponse, sender: "user" });
      props.setMessages(tempArray);

      setTimeout(() => {
        console.log("props.botResponse is", props.botResponse);
        let temp2 = [...tempArray];
        temp2.push(props.botResponse);
        props.setMessages(temp2);
      }, 5000);
    }
  }, [userMessages, botMessages]); // I think this error is wrong

  // enable autoscroll after each message except for the intro
  useEffect(() => {
    if (dummyRef && dummyRef.current && bodyRef && bodyRef.current && props.messages.filter((msg) => msg.sender === "user").length) {
      bodyRef.current.scrollTo({
        top: dummyRef.current.offsetTop,
        behavior: "smooth"
      });
    }
  }, [props.messages]);

  return (
    <div className="message-container" ref={bodyRef}>
      {props.messages.map((chat,idx) => (
        <div key={chat.message +idx}>
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
                  key={option + Math.random()}
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
