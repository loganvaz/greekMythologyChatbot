import React, { useRef, useState } from "react";
// import Chats from "../Chats/Chats";
import "./Chatbot.css";
import "../Chats/Chats.css";
// import "../Helpers/StoryHelpers/Prompting";
import {Story} from "../Helpers/Story";
import { DynamicScoresOfInterest, MessagesInfo, Opinions, OthersOpinions, VisibleScores } from "../interfaces";
import {allIntroMessages} from "../Chats/Chats";
import { rmSync } from "fs";

// import "../Helpers/StoryHelpers/SampleGeneration";

interface ResponseBotObject {
  purpose: string;
  message: string;
  options?: string[];
  sender: string;
}

const myStory = new Story();

const Chatbot: React.FC = () => {
  const [userResponse, setUserResponse] = useState<string>("");
  

  //using usefffect for messages so far
  const [messagesSoFar, setMessagesSoFar] = useState<MessagesInfo[]>(allIntroMessages);
  const [displayableStats, setDisplayableStats] = useState<VisibleScores>(new DynamicScoresOfInterest());
  const [othersOpinions, setOthersOpinions] = useState<Opinions>(new OthersOpinions());
  const [luck, setLuck] = useState<number>(10);
  // let messagesSoFar = allIntroMessages;

  

  // const [step, setStep] = useState<number>(0);
  const [botResponse, setBotResponse] = useState<ResponseBotObject>({
    purpose: "",
    message: "",
    sender: "bot"
  });
  // const [sendUserResponse, setSendUserResponse] = useState<string>("");

  // setting next step when there's response and option click
  const setNextStep = (response: string) => {
    console.log("response is ", response);
    console.log("MESSAGES SO FAR IN CHATBOT IS ", messagesSoFar);
    // setStep(prevState => prevState + 1);
    // setSendUserResponse(response);
    setUserResponse("");
    const msgArray = [...messagesSoFar, {message: response, sender: "user"}]
    // setMessagesSoFar();
    // setBotResponse({ ...{purpose:"hold", message:"Consulting the Muse"}, sender: "bot" });
    
    //why is the message not being changed here?
    const thisLuck = Math.ceil(Math.random()*20);
    setLuck(thisLuck);
    myStory.progressStory(msgArray, thisLuck).then((result) => {
      console.log("result is ", result);
      console.log("outputTxt", result.outputTxt);
      setDisplayableStats(result.updatedScores);
      setOthersOpinions(result.opinionsArray);
      // console.log("messages so far is ", messagesSoFar);
      let res = {
        purpose: "progress story",
        message: result.outputTxt,
      }
      // setMessagesSoFar([...messagesSoFar, {...res, sender: "bot"}]);
      setMessagesSoFar([...msgArray, {...res, sender: "bot"}]);
      setBotResponse({ ...res, sender: "bot" });
      console.log("MESSAGES SO FAR IN CHATBOT IS ", messagesSoFar);
      console.log("bot response set");
      
    }).catch((err) => {
      console.trace();
      let res = {
        purpose: "progress story",
        message: "error of " + err,
      }
      setMessagesSoFar([...msgArray,  {...res, sender: "bot"}]);
      setBotResponse({ ...res, sender: "bot" });
    });;
    
  };

  const optionClick = (e: React.MouseEvent<HTMLElement>) => {
    let option = e.currentTarget.dataset.id;
    if (option) {
      setNextStep(option);
    }
  };

  // event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    setUserResponse(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("setting messages so far in handleSubmit")
    // setMessagesSoFar([...messagesSoFar, {message: userResponse, sender: "user"}]);
    setMessagesSoFar([...messagesSoFar, {purpose:"user input", message: userResponse, sender: "user"}]);
    setNextStep(userResponse);
  };

  const dummyRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <>
      Score Tracking
      <div className="meta-info" style={{display:"flex", fontSize:".5em"}}>
          <div className="displayable-score">food: {displayableStats.food} / 100</div>
          <div className="displayable-score">shipQuality: {displayableStats.shipQuality} / 100</div>
          <div className="displayable-score">time: {displayableStats.time}</div>
          <div className="displayable-score">numCrew: {displayableStats.numCrew}</div>
          <div className="displayable-score">gold: {displayableStats.gold}</div>
          <div className="displayable-score">fame: {displayableStats.fame}</div>
          <div className="displayable-score">luck (last action): {luck}</div>
      </div>
      <div className="people-of-interest">
        people of interest is weird rn
        {/* People of Interest: {othersOpinions.entities.map((entity, idx) => {
          return <div>{entity}, {othersOpinions.opinions[idx]}, {othersOpinions.whys[idx]}</div>
        })} */}
      </div>
      <div className="chat-container">
        <div className="message-container" ref={bodyRef}>
        {messagesSoFar.map((chat,idx) => (
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
                    // onClick={e => props.optionClick(e)}
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
        <form onSubmit={e => handleSubmit(e)} className="form-container">
          <input
            onChange={e => handleInputChange(e)}
            value={userResponse}
          ></input>
          <button>
            <i className="far fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
