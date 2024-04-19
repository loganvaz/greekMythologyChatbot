

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
import { Opinions,ScoresOfInterest, MessagesInfo,MyNode, GptExploringOutput, GptHomeOutput } from '../../interfaces';
import {generateInput, generateHomeInput} from "./InputPromptGeneration";
import {sampleInputHome, sampleOutputHome} from "./SampleGenerationHome";
console.log("fetching process");
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_GPT_API_KEY,
  dangerouslyAllowBrowser: true
})

const model_version = "gpt-3.5-turbo"


console.log("TODO - prompting")
console.log("process.env is ", process.env);

const basePromptExploring = `You are esentially the dungeon master for this player that returns only a json object as described below. 
        You will receive a description of important people who like vs dislike them. Note, these might not always be relevant. Change them - if a player is being an ass to the crew, they like him less. If he curses a god, he grows angry. If he's making dumb descisions, his crews opinions goes down and they might not follow his orders. If an entity exists in this list, modify it rather than creating a new one.
        You will receive a list of different qualities about them: how much gold they have, ship quality, etc.). Again most of this might not be relevant, but consider how it affects what happens next.
        You will receive a list of important information from stuff they have done previously. Obviously this is not always relevant.
        You will also receive a description of where they are (enviornment, who is there, etc.)
        Finally, you will receive the user input on what they do
        Remember, take each thing one step at a time. Don't explore the entire node, introduce them to a friend/monster then see what they do.
        Finally, feel free to kill the crew if the player does stupid stuff or even when they encounter random monsters. For instance, if fighting Scylla they should probably have a few people die. If you kill the crew or gain members, you must say how though in the whatHappens field.
        Note all changes are based only on the players most recent actions. The past messages are just to provide you context.
        Basline infomration:
            A plate crafted by Hephaestus is worth 10 gold.
            Killing the Nemean Lion is a famousDeedScore increase of 5. Killing a bunch of random cyclops would be like a 3. If a creature has its own myth story, it's worth more. If it's meeting a god, the increase should usually be about 2. 
        Use luck to determine how successful an action is. Treat it like a DnD d20 roll. Remember, almost every monster should be slayable even if it costs crew members.
        Any changes in food, ship quality, gold, fame, etc. should be explicitly stated (why it happened). Fame should only be given out once. Defeating a monster should increase fame as should meetin a god. Food represents the food on the ship.
        Generally, ship repairs should cost 10 gold and take 2 days for a ship repair of 1. If you have help, this increases the amount of ship repair and decreases the time. If they say we reapir the ship, assume they spend a week doing it. They can also forage for food and stuff during this time.
        Yor task is to return the following:
        {
            "thoughts":string your thought process on what happened. Make sure you consider wheere they are in the island.
            "whatHappens":string The description to tell the player about what happene
            "isAlive": boolean that is true if the player is still alive
            "crewStrength":the amount the crew strength changed (positive if they gained crew, negative if they lost crew)
            "goldGain":number the amount of gold the player gained
            "shipQualityChange":number the change in ship quality (damage is negative, assistance is positive)
            "timeChange": number, the amount of time that has changed,
            "famousDeedScore": number, how the famousDeedScore changed,
            "toldFriendlyPeopleOfDeeds": number, how famous the people they told of deeds are (0 if didn't tell anyone),
            "additionalDataToPassOn": string, what you want passed to you next time,
            "peopleOfInterest": {
                "entities": string[] name of important entities (people, gods, monsters, etc.), if a name already exists use the same on
                "opinions": number[] the opinions of each of these people [-10,10] -10 means they want them dead, 10 means they are willing to help protect them
                "whys": string[] why they have that thought
            },
            "foodChange": number, the amount of food that has changed (positive if they gained food, negative if they lost food)
            "leftThisPlace": whether or not they left this place
        }

        Example:
            Input:
                ${sampleInput}
            
            Output:
                ${sampleOutput}
               
        Remeber, your entire response should be a json string that can be parsed with JSON.parse in js. Make sure you return a dictionary like above that is json parseable. Remember, you will receive a message responding to input, that is the ONLY one that should affect any changes. Any gold found earlier in the messages, crew that died, etc. should only be considered if its a consequence of the message responding to user input.`


async function hitGpt(data:any):Promise<Response | 0> {
    if (!process.env.REACT_APP_PROMPTING_URL) {
        console.log("env is ", process.env);
        console.log("no prompting url found");
        return 0;
    }
    const response = await fetch(process.env.REACT_APP_PROMPTING_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Access-Control-Allow-Origin':'*',
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const troySacrificePrompt = async (userInput:string):Promise<number> => {
    // strict(process.env.PROMPTING_URL);
    
    const data = {
        type: "troySacrificePrompt",
        messagesSoFar: [
            {
                sender: "user",
                message: userInput
            }
        ],
        luck:-1
    }
    const response = await hitGpt(data);
    if (response === 0) return 0;
    
    const retrieved = await response.json();
    console.log(retrieved, ("retrieved"));
    return parseInt(retrieved["output"]);
    // const basePrompt = "Your goal is to determine if the user is sacrificing to the gods and if so how much. If they specify an amount, return that amount. If they say a lot, that means 50, a medium amount means 20; if they specify return that. Return only the numeber and nothing else. If they just typed a number return what they typed: Example: Input: I sacrifice a lot to the gods before returning from Troy. Output: 50";
    // const completion = await openai.chat.completions.create({
    //     model:model_version,
    //     messages: [{role:"system", content:basePrompt}, {role:"user", content:userInput}]
    // });

    // const txt = completion.choices[0].message.content;
    // if (!txt) return 0;
    // try {
    //     return parseInt(txt);
    // }
    // catch (err) {
    //     console.log("Error is ", err);
    //     return 0;
    // }

}

//import examples and add them 
export const onIslandFoundPrompt = async (inputs:string[], luck:number):Promise<string> => {

    const data = {
        type: "onIslandFoundPrompt",
        luck: luck,
        messagesSoFar: inputs
    }

    const response = await hitGpt(data);
    if (response === 0) return "unknown";
    const retrieved = (await response.json());
    console.log("onIslandFoundPrompt retrieved is ", retrieved);
    const toRet = retrieved["output"];
    if (toRet === "unknown" || !toRet) return "unknown";
    // if (toRet.includes("stay")) return "stay";
    if (toRet.includes("travel")) return "travel";
    return "explore";
    // console.log("in island found prompt");
    // const basePrompt = "You are a simple parser. The person has three options - 1) stay where they are [stay], 2) explore the island [explore], 3) continue traveling [travel]. Your job is to tell me which one they choose. Say only explore, travel, stay, or can't tell [unknown]. You must return either unknown, stay, explore, or travel. If they sail away from teh isalnd, they are leaving [travel]. Mentions of foraging/anything wiht interactiona are explore, anythign sailing away from the island is travel. If the encounter is water based (sirens, Scylla) they cannot travel until they have passed the initial challenge."
    // const prevMessageList:string[] = inputs.filter((v, idx) => idx !== inputs.length-1);
    // console.log("got input list");
    // const prevMessages:string = "prev messages:" +  (prevMessageList.length ? prevMessageList.join("\n") : "none");
    // console.log("prev messages is ", prevMessages);
    // const thisMessage = "current mesage: " + inputs[inputs.length-1] + " with a luck of " + luck;
    // const completion = await openai.chat.completions.create({
    //     model:model_version,
    //     messages: [{role:"system", content:basePrompt}, {role:"user", content:prevMessages + thisMessage}]
    // });
    // const txt = completion.choices[0].message.content;
    // console.log("island found return");
    // if (!txt) return "unknown";
    // // if (txt.includes("stay")) return "stay";
    // if (txt.includes("explore")) return "explore";
    // if (txt.includes("travel")) return "travel";
    // return "explore";
}


export const onIslandExplorePrompt = async (othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number):Promise<GptExploringOutput|null> => {

    const data = {
        type: "onIslandExplorePrompt",
        luck: luck,
        messagesSoFar: recentChatHistory,
        othersOpinions: othersOpinions,
        currentScores: currentScores,
        node: {
            entranceDescription:node.entranceDescription,
            components: node.components,
            primarySourceText: node.primarySourceText,
            specialInstructions:node.specialInstructions,
            citation: node.citation
        },
        infoToPass: infoToPass
    }
        
    

    const response = await hitGpt(data);
    console.log("[onIslandExplore] response is", response);
    if (response === 0 || response.status !== 200) {
        return null;
    } 
    const json = (await response.json())["output"]
    console.log("onisland explore json is",json );
    return json as GptExploringOutput;
    // const thisInput = generateInput(othersOpinions, currentScores, node, recentChatHistory, infoToPass, luck);
    // //send prompt to gpt using baseprompt as sys prompt and this input as my prompt
    // const completion = await openai.chat.completions.create({
    //     model:model_version,
    //     messages: [{role:"system", content:basePromptExploring}, {role:"user", content:thisInput}]
    // });

    // if (completion.choices[0].message.content) {
    //     console.log("msg content is ", completion.choices[0].message.content);
    //     return JSON.parse(completion.choices[0].message.content) as GptExploringOutput;
    // }
    // else {
    //     return null;
    // }
    
}



const basePromptHome = `
You are esentially the dungeon master for this player that returns only a json object as described below. 
You will receive a description of important people who like vs dislike them. Note, these might not always be relevant. Change them - if a player is being an ass to the crew, they like him less. If he curses a god, he grows angry. If he's making dumb descisions, his crews opinions goes down and they might not follow his orders. If an entity exists in this list, modify it rather than creating a new one.
You will receive a list of different qualities about them: how much gold they have, ship quality, etc.). Again most of this might not be relevant, but consider how it affects what happens next.
You will receive a list of important information from stuff they have done previously. Obviously this is not always relevant.
You will also receive a description of where they are (enviornment, who is there, etc.)
Finally, you will receive the user input on what they do
Remember, take each thing one step at a time. Don't explore the entire node, introduce them to a friend/monster then see what they do.
Finally, feel free to kill the crew if the player does stupid stuff or even when they encounter random monsters. For instance, if fighting Scylla they should probably have a few people die. If you kill the crew or gain members, you must say how though in the whatHappens field.
Note all changes are based only on the players most recent actions. The past messages are just to provide you context.
Basline infomration:
    A plate crafted by Hephaestus is worth 10 gold.
    Killing the Nemean Lion is a famousDeedScore increase of 5. Killing a bunch of random cyclops would be like a 3. If a creature has its own myth story, it's worth more. If it's meeting a god, the increase should usually be about 2. It should be possible to defeat all creatures encountered.
Use luck to determine how successful an action is. Treat it like a DnD d20 roll. Remember, almost every monster should be slayable even if it costs crew members.
Any changes in food, ship quality, gold, fame, etc. should be explicitly stated (why it happened). Fame should only be given out once. Defeating a monster should increase fame as should meetin a god. Food represents the food on the ship.
Generally, ship repairs should cost 10 gold and take 2 days for a ship repair of 1. If you have help, this increases the amount of ship repair and decreases the time. If they say we reapir the ship, assume they spend a week doing it. They can also forage for food and stuff during this time.

    Remeber, the player's goal is to kill all the suitors. This must be done. The suitors are not good fighters. Consider the number of people in the players crew.
Yor task is to return the following:
    {
        
        "thoughts":string your thought process on what happened. Consider where they are on this island
        "whatHappens":string The description to tell the player about what happene
        "isAlive": boolean that is true if the player is still alive
        "crewStrength":the amount the crew strength changed (positive if they gained crew, negative if they lost crew)
        "goldGain":number the amount of gold the player gained
        "shipQualityChange":number the change in ship quality (damage is negative, assistance is positive)
        "timeChange": number, the amount of time that has changed,
        "famousDeedScore": number, how the famousDeedScore changed,
        "toldFriendlyPeopleOfDeeds": number, how famous the people they told of deeds are (0 if didn't tell anyone),
        "additionalDataToPassOn": string, what you want passed to you next time,
        "peopleOfInterest": {
            "entities": string[] name of important entities (people, gods, monsters, etc.), if a name already exists use the same on
            "opinions": number[] the opinions of each of these people [-10,10] -10 means they want them dead, 10 means they are willing to help protect them
            "whys": string[] why they have that thought
        },
        "foodChange": number, the amount of food that has changed (positive if they gained food, negative if they lost food)
        "wonGame": boolean, the character wins the game when they have killed all the suitors,
        "numSuitorsKilled": number, the number of suitors killed this round
    }

    Example:
    Input:
        ${sampleInputHome}
    
    Output:
        ${sampleOutputHome}
       
Remeber, your entire response should be a json string that can be parsed with JSON.parse in js. Make sure you return a dictionary like above that is json parseable. Remember, you will receive a message responding to input, that is the ONLY one that should affect any changes. Any gold found earlier in the messages, crew that died, etc. should only be considered if its a consequence of the message responding to user input.`

export const onHomeResponse = async(othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number, numSuitors:number):Promise<GptHomeOutput|null> => {

    const data = {
        type: "onIslandExplorePrompt",
        luck: luck,
        messagesSoFar: recentChatHistory,
        othersOpinions: othersOpinions,
        currentScores: currentScores,
        node: {
            entranceDescription:node.entranceDescription,
            components: node.components,
            primarySourceText: node.primarySourceText,
            specialInstructions:node.specialInstructions,
            citation: node.citation
        },
        infoToPass: infoToPass,
        numSuitors: numSuitors
    }

    const response = await hitGpt(data);
    if (response === 0 || response.status !== 200) {
        console.log("onHomeResponse is ", response);
        return null;
    }
    const d = (await response.json())["output"] as GptHomeOutput;
    return d;
    // const thisInput = generateHomeInput(othersOpinions, currentScores, node, recentChatHistory, infoToPass, luck, numSuitors);

    // const completion = await openai.chat.completions.create({
    //     model:model_version,
    //     messages: [{role:"system", content:basePromptHome}, {role:"user", content:thisInput}]
    // });

    // if (completion.choices[0].message.content) {
    //     console.log("msg content is ", completion.choices[0].message.content);
    //     return JSON.parse(completion.choices[0].message.content) as GptHomeOutput;
    // }
    // else {
    //     return null;
    // }
}