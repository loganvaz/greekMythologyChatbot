//this is honestly going to a lot like the Prompting file except I have the output response

import {ScoresOfInterest, MyNode, MessagesInfo, Opinions, NodePart, GptExploringOutput} from "../../interfaces";
import { generateInput } from "./InputPromptGeneration";

import scylla from "../../NodeData/charybdis_scylla.json";

/* [
    Others Opinions, 
    DynamicScoresOfInterest Description, 
    Node Description,
    Recent Chat History (either all on this island or for now last 3 or something), 
    This Chat History, 
    Where they are in the Node
    ]

    -> 
    {
        thoughts: 
            food: food causes this
            shipQuality: ex: the enemy sees the ships are in bad quality and attacks.
            opinion of crew causes this. Zues is displeased but unlikely to react right now., etc.
            based on the recent chat we know the giant is hostile becaue you attacked him
        data:
            whatHappens: string to display to user on what happens
            isAlive: whether the user is still alive.
            crewStrength: what the new crew strength is (0-20)
            goldGain: the amout of gold/valuables they have gained
            shipQuality: the new ship quality after this encounter
            timeChange: the amount of time that has changed in days. If it's less than a day, should be 0.
            famousDeedsScore: the amount (1-5) that their heroic fame has increased. This is from stuff like killing monsters or meeting gods.
            toldFriendlyPeopleOfDeeds: weather or not they told friendly people about deeds. Put 0 if they told nobody or rank 1 (peasnant) to 5 (god) based on how important the person they boasted to was/how impressed they were.
            additionalDataToPassOn: if anything important happened that you want to keep track of, put it here. Perfectly okay to usually leave this blank. This will not be shown to the user but will be passed on to you in the next step
            peopleOfInterest: any new people of interest and their thoughts from [-10,10]. -10 means they want them dead, 10 means they are willing to help protect them. None of these people can actually kill, but this might influence future encounters (you piss off Poseidon so he makes a sea monster you're fighting more powerful)


    }

*/



// fame:number;
// food:number;
// gold:number;
// shipQuality:number;
// time:number;
// numCrew:number;


export const sampleOutputScyllaLuck15 = (numCrewBefore:number, peopleOfInterest:Opinions):GptExploringOutput => {
    const st = `
    {
        "thoughts": "Rolled well (and Apollo is helping so we can increase the roll by 2) so can prevent the monster from killing six as normal. However, the ship is going to take damage from both her and the water. Preventing Scylla from taking a crew member hasn't been done before so that deserves some fame.",
        "whatHappens": "Suddenly, a terrible six headed monster bursts from the top of the cliff, which you recognize as Scylla. You aim your bow at her and let lose a shot (guided by the favor of Apollo), forcing her to drop one of your men. However, you can do no further harm and as your crew member falls, he hits the ship, breaking it slightly.",
        "isAlive": true,
        "crewStrength": ${numCrewBefore-5},
        "goldGain": 0,
        "shipQuality": -10,
        "timeChange": 0,
        "famousDeedScore": 1,
        "toldFriendlyPeopleOfDeeds": 0,
        "additionalDataToPassOn": "The crew just lost several friends to Scylla and so is likely scared for the next few days",
        "peopleOfInterest": {
            "entities": ${JSON.stringify(peopleOfInterest.entities)},
            "opinions": ${JSON.stringify(peopleOfInterest.opinions)},
            "whys": ${JSON.stringify(peopleOfInterest.whys)}
        },
        "leftThisPlace": false
    }
`
    // console.log("json thinking of returning is ", st);
    return  JSON.parse(st.trim());
    // return {
    //     "thoughts": "Rolled well (and Apollo is helping so we can increase the roll by 2) so can prevent the monster from killing six as normal. However, the ship is going to take damage from both her and the water. Preventing Scylla from taking a crew member hasn't been done before so that deserves some fame.",
    //     "whatHappens": "Suddenly, a terrible six headed monster bursts from the top of the cliff, which you recognize as Scylla. You aim your bow at her and let lose a shot (guided by the favor of Apollo), forcing her to drop one of your men. However, you can do no further harm and as your crew member falls, he hits the ship, breaking it slightly.",
    //     "isAlive": true,
    //     "crewStrength": numCrewBefore-5,
    //     "goldGain": 0,
    //     "shipQuality": -10,
    //     "timeChange": 0,
    //     "famousDeedScore": 1,
    //     "toldFriendlyPeopleOfDeeds": 0,
    //     "additionalDataToPassOn": "The crew just lost several friends to Scylla and so is likely scared for the next few days",
    //     "peopleOfInterest": {
    //         "entities": peopleOfInterest.entities,
    //         "opinions": peopleOfInterest.opinions,
    //         "whys": peopleOfInterest.whys
    //     },
    //     "leftThisPlace": false
    // }
}

//now lets generate an example to put into the prompt


scylla.components = scylla.components.map((c:NodePart) => {
    c.status = ["friendly", "hostile", "nuetral"].includes(c.status) ? c.status : "nuetral";
    return c as NodePart;
});


const othersOpinions:Opinions = {
    entities: ["crew", "Poseidon", "Apollo"],
    opinions: [10, 0, 3],
    whys: ["you are generally well liked by the crew", "doesn't have an opinion of you yet", "Apollo is happy you sacrified to him"],
};

const numCrew = 16;
const currentScores:ScoresOfInterest = {
    fame:5,
    food:50,
    gold:200,
    shipQuality:45,
    time:10,
    numCrew:numCrew
}

const recentChatHistory:MessagesInfo[] = [
    {
        message: "You come across a narrow strait with a whirlpool blocking one edge, but high cliffs on the other side. However, squinting you can see the bones of every manner of creature on the side of cliff.",
        sender: "bot"
    },
    {
        message: "I near the cliff because I can't survive the whirlpool",
        sender:"user"
    },
    {
        message:"You near the cliff and the crew sighs in relief as you avoid the edge. But you begin to feel something amiss, and you recall an old legend. Whatever lives by the cliff always takes its toll",
        sender: "bot"
    },
    {
        message:"You near the cliff and the crew sighs in relief as you avoid the edge. But you begin to feel something amiss, and you recall an old legend. Whatever lives by the cliff always takes its toll",
        sender: "bot"
    },
    {
        message: "I get my bow ready to shoot whatever comes near when it attacks",
        sender:"user"
    }
]

const infoToPass = "The ships have been badly damaged by a storm and are prone to breaking. The men are eager to get home and have extra trust in the player after escaping the giants";
const luck = 15;
export const sampleInput = generateInput(othersOpinions, currentScores, new MyNode(scylla.entranceDescription, scylla.components, scylla.primarySourceText, scylla.specialInstructions,scylla.citation) , recentChatHistory, infoToPass, luck);
// console.log(sampleInput)

export const sampleOutput = sampleOutputScyllaLuck15(numCrew, othersOpinions)
// console.log(sampleOutput)


