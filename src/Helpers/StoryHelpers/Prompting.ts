

/*
       TODO - add example


    Dynamic Input:
        List of People of Interest and Their Thoughts
        List of Scores of Interest
        List of GPT Important data to pass on 
        Node description
        Story info to the user
        User input on what they do (I fight the cyclopse)

*/

import OpenAI from 'openai';
import { sampleInput, sampleOutput } from './SampleGeneration';
import { Opinions,ScoresOfInterest, MessagesInfo,MyNode, GptExploringOutput } from '../../interfaces';
import {generateInput} from "./InputPromptGeneration";
console.log("fetching process");
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_GPT_API_KEY,
  dangerouslyAllowBrowser: true
})


console.log("TODO - prompting")
console.log("process.env is ", process.env);

const basePromptExploring = `You are esentially the dungeon master for this player. You will receive a description of important people who like vs dislike them. Note, these might not always be relevant.
        You will receive a list of different qualities about them: how much gold they have, ship quality, etc.). Again most of this might not be relevant, but consider how it affects what happens next.
        You will receive a list of important information from stuff they have done previously. Obviously this is not always relevant.
        You will also receive a description of where they are (enviornment, who is there, etc.)
        Finally, you will receive the user input on what they do


        Basline infomration:
            A plate crafted by Hephaestus is worth 10 gold.
            Killing the Nemean Lion is a famousDeedScore increase of 5. Killing a bunch of random cyclops would be like a 3. If a creature has its own myth story, it's worth more. If it's meeting a god, the increase should usually be about 2. 

        Your task from here is to the following:
            1) Think about how all these would interact. If they are low on gold and food and the people are good, they will receive help. If they are beseiged by giants but Hermes is on their side, perhaps they'll be able to deceive their way out of the situation.
            2) Describe what happens. For instance: the cyclops you foolishly chose to fight barehanded kills and eats you. Or the giant hears your sad song, and because Aphrodite favors you she moves his heart into taking mercy on you.
            3) Describe if they transition to a new state. This should be a string that says "same" if they stay in the same place "deeper" if they go deeper into the enviornment they are in, or "leave" if they are leaving on ship.
            4) Describe import features about the change in their situation
                isAlive: boolean if they died or not
                crewStrength: what the new crew strength is (0-20)
                goldGain: the amout of gold/valuables they have gained
                shipQuality: the new ship quality after this encounter
                timeChange: the amount of time that has changed in days. If it's less than a day, should be 0.
                famousDeedsScore: the amount (1-5) that their heroic fame has increased. This is from stuff like killing monsters or meeting gods.
                toldFriendlyPeopleOfDeeds: weather or not they told friendly people about deeds (boolean)
                additionalDataToPassOn: if anything important happened that you want to keep track of, put it here. Perfectly okay to usually leave this blank.
                peopleOfInterest: any new people of interest and their thoughts from [-10,10]. -10 means they want them dead, 10 means they are willing to help protect them. None of these people can actually kill, but this might influence future encounters (you piss off Poseidon so he makes a sea monster you're fighting more powerful)
                goesToNextIsland: whether or not they go to the next island
        Example (remember - your output should only be a json parseable string):
            Input:
                ${sampleInput}
            
            Output:
                ${sampleOutput}
                `


export const troySacrificePrompt = async (userInput:string):Promise<number> => {
    const basePrompt = "Your goal is to determine if the user is sacrificing to the gods and if so how much. If they specify an amount, return that amount. If they say a lot, that means 50, a medium amount means 20; if they specify return that. Return only the numeber and nothing else: Example: Input: I sacrifice a lot to the gods before returning from Troy. Output: 50";
    const completion = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        messages: [{role:"system", content:basePrompt}, {role:"user", content:userInput}]
    });

    const txt = completion.choices[0].message.content;
    if (!txt) return 0;
    try {
        return parseInt(txt);
    }
    catch (err) {
        console.log("Error is ", err);
        return 0;
    }

}

//import examples and add them 
export const onIslandFoundPrompt = async (userInput:string):Promise<string> => {
    const basePrompt = "You are a simple parser. The person has three options - 1) stay where they are [stay], 2) explore the island [explore], 3) continue traveling [travel]. Your job is to tell me which one they choose. Say only explore, travel, stay, or can't tell [unknown]. You must return either unknown, stay, explore, or travel"
    const completion = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        messages: [{role:"system", content:basePrompt}, {role:"user", content:userInput}]
    });
    const txt = completion.choices[0].message.content;
    if (!txt) return "unknown";
    if (txt.includes("stay")) return "stay";
    if (txt.includes("explore")) return "explore";
    if (txt.includes("travel")) return "travel";
    return "unknown";
}


export const onIslandExplorePrompt = async (othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number):Promise<GptExploringOutput|null> => {
    const thisInput = generateInput(othersOpinions, currentScores, node, recentChatHistory, infoToPass, luck);
    //send prompt to gpt using baseprompt as sys prompt and this input as my prompt
    const completion = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        messages: [{role:"system", content:basePromptExploring}, {role:"user", content:thisInput}]
    });
    console.log("completion is ", completion);
    if (completion.choices[0].message.content) {
        return JSON.parse(completion.choices[0].message.content) as GptExploringOutput;
    }
    else {
        return null;
    }
    
}