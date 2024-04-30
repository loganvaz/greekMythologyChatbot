import { Opinions,ScoresOfInterest, MessagesInfo,MyNode, GptExploringOutput, GptHomeOutput } from '../../interfaces';


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
    userInput = "The user tries to :" + userInput;
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

}

//import examples and add them 
export const onIslandFoundPrompt = async (inputs:string[], luck:number):Promise<string> => {
    if (inputs[inputs.length - 1].includes("explore")) return "explore";
    if (inputs[inputs.length - 1].includes("skip")) return "travel";

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
}


const markUserChats = (recentChatHistory:MessagesInfo[]):MessagesInfo[] => {
    return recentChatHistory.map((v) => {
        const v2 = {...v};
        v2.message = v.sender === "user" ? "The user says they will attempt the following: " + v.message : v.message;
        return v2;
    });
}

export const onIslandExplorePrompt = async (othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number):Promise<GptExploringOutput|null> => {

    recentChatHistory = markUserChats(recentChatHistory);

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
        infoToPass: ""
    }
        
    

    const response = await hitGpt(data);
    console.log("[onIslandExplore] response is", response);
    if (response === 0 || response.status !== 200) {
        return null;
    } 
    const json = (await response.json())["output"]
    console.log("onisland explore json is",json );
    return json as GptExploringOutput;
   
}

export const onHomeResponse = async(othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number, numSuitors:number):Promise<GptHomeOutput|null> => {

    const data = {
        type: "onHomeResponse",
        luck: luck,
        messagesSoFar: markUserChats(recentChatHistory),
        othersOpinions: othersOpinions,
        currentScores: currentScores,
        node: {
            entranceDescription:node.entranceDescription,
            components: node.components,
            primarySourceText: node.primarySourceText,
            specialInstructions:node.specialInstructions,
            citation: node.citation
        },
        infoToPass: "",
        numSuitors: numSuitors
    }

    const response = await hitGpt(data);
    if (response === 0 || response.status !== 200) {
        console.log("onHomeResponse is ", response);
        return null;
    }
    const d = (await response.json())["output"] as GptHomeOutput;
    return d;
}