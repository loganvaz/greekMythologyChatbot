import { Opinions, ScoresOfInterest, MyNode, MessagesInfo } from "../../interfaces";

export const generateInput = (othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number):string => {
    const st = `
        Info To Pass On: ${infoToPass}
        Island Description: ${node.getNodeString()}
        Chat History: ${recentChatHistory.map((msgInfo) => `(${msgInfo.sender}) ${msgInfo.message}`).join("; ")}
        Number in Crew Scores: ${currentScores.numCrew}
        Ship Quality (of 100): ${currentScores.shipQuality}
        Food (2 consumed per day): ${currentScores.food}
        Time (days): ${currentScores.time}
        Fame: ${currentScores.fame}
        Luck (use as a d20 roll to determine how likely this is to succeed, only actions within reason may succeed): ${luck}
        Message Responding To: ${recentChatHistory[recentChatHistory.length-1].message}
    `.trim();

    console.log("st is ", st);
    return st;
}

export const generateHomeInput = (othersOpinions:Opinions, currentScores: ScoresOfInterest, node:MyNode, recentChatHistory:MessagesInfo[], infoToPass:string, luck:number, numSuitors:number):string => {
    const st = `
        Info To Pass On: ${infoToPass}
        Island Description: ${node.getNodeString()}
        Chat History: ${recentChatHistory.map((msgInfo) => `(${msgInfo.sender}) ${msgInfo.message}`).join("; ")}
        Number in Crew Scores: ${currentScores.numCrew}
        Ship Quality (of 100): ${currentScores.shipQuality}
        Food (2 consumed per day): ${currentScores.food}
        Number of suitors left: ${numSuitors}
        Time (days): ${currentScores.time}
        Fame: ${currentScores.fame}
        Luck (use as a d20 roll to determine how likely this is to succeed, only actions within reason may succeed): ${luck}
        Message Responding To: ${recentChatHistory[recentChatHistory.length-1].message}
    `.trim();
    console.log("home input is ", st);
    return st;
    
}