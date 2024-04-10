//this is honestly going to a lot like the Prompting file except I have the output response

import {ScoresOfInterest, MyNode, MessagesInfo, Opinions, NodePart, GptExploringOutput} from "../../interfaces";
import { generateHomeInput } from "./InputPromptGeneration";

import home from "../../NodeData/home.json";

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


export const sampleOutputHomeLuck12 = (numCrewBefore:number, peopleOfInterest:Opinions):GptExploringOutput => {
    const st = `
    {
        "thoughts": "He rolled okay and got the suitors by surprise. Because he caught them by surprise, he should only be able to kill a few of them. However, since Telemachus and 4 crew members joined in they can also kill quite a few people. There are still many suitors left though.",
        "whatHappens": "You leap out of where you were hidden, catching the suitors by surprise. Two arrows find the front two before they realize what's upon them. Your allies join the fray too, slaying another 2 suitors. The suitors stumble up from the table.",
        "isAlive": true,
        "crewStrength": 0,
        "goldGain": 0,
        "shipQualityChange": 0,
        "timeChange": 0,
        "famousDeedScore": 0,
        "toldFriendlyPeopleOfDeeds": 0,
        "additionalDataToPassOn": "The suitors are surprised but now know they are under atack - they are mostly unarmed though because they were caught feasting.",
        "peopleOfInterest": {
            "entities": ${JSON.stringify(peopleOfInterest.entities)},
            "opinions": ${JSON.stringify(peopleOfInterest.opinions)},
            "whys": ${JSON.stringify(peopleOfInterest.whys)}
        },
        "foodChange": 0,
        "wonGame": false,
        "numSuitorsKilled": 4
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


home.components = home.components.map((c:NodePart) => {
    c.status = ["friendly", "hostile", "nuetral"].includes(c.status) ? c.status : "nuetral";
    return c as NodePart;
});


const othersOpinions:Opinions = {
    entities: ["crew"],
    opinions: [6, 0, 3],
    whys: ["you are generally well liked by the crew; they are angered that you didn't tell them about Scylla so they like you less; they are happy you shared gold with them so thye like you more now"],
};

const numCrew = 12;
const currentScores:ScoresOfInterest = {
    fame:5,
    food:50,
    gold:200,
    shipQuality:45,
    time:100,
    numCrew:numCrew
}

const recentChatHistory:MessagesInfo[] = [
    {
        message: home.entranceDescription,
        sender: "bot"
    },
    {
        message: "I order my crew to pull up on the other side of the island so we can be undetected.",
        sender:"user"
    },
    {
        message:"You successfully avoid detection. What would you like to do next?",
        sender: "bot"
    },
    {
        message:"I disguise myself and look for Telemachus so I can tell him I've returned",
        sender: "user"
    },
    {
        message:"You search for a few hours before you find him, keeping your identity hidden from eveyrone else. He doesn't believe you at first but when your childhood caretaker identifies you he believes you. He tells you the suitors here have been trying to marry your wife and disrespecting your house.",
        sender: "bot"
    },
    {
        message:"I decide we'll ambush them and tell my crew to prepare to attack while they're dining",
        sender: "user"
    },
    {
        message:"You hide amongst the house while they are feasting successfully. What would you like to do?",
        sender: "bot"
    },

    {
        message: "I give the signal to attack then begin firing with my bow.",
        sender:"user"
    }
]

const infoToPass = "The ships have been badly damaged by a storm and are prone to breaking. The men are eager to get home and have extra trust in the player after escaping the giants; the men are upset about not being told about scylla; the men are happy you shared gold with them; you are told by Aeolus that you must be prepared when you return home; you finally reach home";
const luck = 12;
export const sampleInputHome = generateHomeInput(othersOpinions, currentScores, new MyNode(home.entranceDescription, home.components, home.primarySourceText, home.specialInstructions,home.citation) , recentChatHistory, infoToPass, luck, 30);
// console.log(sampleInput)

export const sampleOutputHome = sampleOutputHomeLuck12(numCrew, othersOpinions)
// console.log(sampleOutput)


