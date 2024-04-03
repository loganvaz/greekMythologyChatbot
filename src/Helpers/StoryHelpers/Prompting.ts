

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
        Remember, take each thing one step at a time. Don't explore the entire node, introduce them to a friend/monster then see what they do.


        Basline infomration:
            A plate crafted by Hephaestus is worth 10 gold.
            Killing the Nemean Lion is a famousDeedScore increase of 5. Killing a bunch of random cyclops would be like a 3. If a creature has its own myth story, it's worth more. If it's meeting a god, the increase should usually be about 2. 

        Yor task is to return the following:
        {
            "thoughts":string your thought process on what happened
            "whatHappens":string The description to tell the player about what happene
            "isAlive": boolean that is true if the player is still alive
            "crewStrength":number the new crew strength
            "goldGain":number the amount of gold the player gained
            "shipQuality":number the change in ship quality (damage is negative, assistance is positive)
            "timeChange": number, the amount of time that has changed,
            "famousDeedScore": number, how the famousDeedScore changed,
            "toldFriendlyPeopleOfDeeds": number, how famous the people they told of deeds are (0 if didn't tell anyone),
            "additionalDataToPassOn": string, what you want passed to you next time,
            "peopleOfInterest": {
                "entities": string[] name of important entities (people, gods, monsters, etc.), if a name already exists use the same on
                "opinions": number[] the opinions of each of these people [-10,10] -10 means they want them dead, 10 means they are willing to help protect them
                "whys": string[] why they have that thought
            },
            "leftThisPlace": whether or not they left this place
        }

        Example:
            Input:
                ${sampleInput}
            
            Output:
                ${sampleOutput}
               
        Remeber, your entire response should be a json string that can be parsed with JSON.parse in js. Make sure you return a dictionary like above that is json parseable `


export const troySacrificePrompt = async (userInput:string):Promise<number> => {
    const basePrompt = "Your goal is to determine if the user is sacrificing to the gods and if so how much. If they specify an amount, return that amount. If they say a lot, that means 50, a medium amount means 20; if they specify return that. Return only the numeber and nothing else. If they just typed a number return what they typed: Example: Input: I sacrifice a lot to the gods before returning from Troy. Output: 50";
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
    return "explore";
}


export const onIslandExplorePrompt = async (othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number):Promise<GptExploringOutput|null> => {
    const thisInput = generateInput(othersOpinions, currentScores, node, recentChatHistory, infoToPass, luck);
    //send prompt to gpt using baseprompt as sys prompt and this input as my prompt
    const completion = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        messages: [{role:"system", content:basePromptExploring}, {role:"user", content:thisInput}]
    });

    if (completion.choices[0].message.content) {
        console.log("msg content is ", completion.choices[0].message.content);
        return JSON.parse(completion.choices[0].message.content) as GptExploringOutput;
    }
    else {
        return null;
    }
    
}