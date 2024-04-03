//define our class that determines story interaction


// class Story {

//     constructor() {
//         //first, we need to load in the relevant nodes
//     }   


// }

// export default Story;
import { updateInterfaceDeclaration } from "typescript";
import aeolus from "../NodeData/aeolus.json";
import charydbis_scyllab from "../NodeData/charybdis_scylla.json";
import hydra from "../NodeData/hydra.json";
import lamus from "../NodeData/lamus.json";
import lotus from "../NodeData/lotus.json";
import sirens from "../NodeData/sirens.json";
import troy from "../NodeData/troy.json";
import {MyNode, NodePart, TravelCost, DynamicScoresOfInterest, OthersOpinions, MessagesInfo, VisibleScores} from "../interfaces";

let group = [aeolus,charydbis_scyllab,hydra,lamus,lotus,  sirens];
console.log("group is ", group);


// from free code camp
const shuffle = (array: any[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 


interface NextLL {
    next?:LL,
    prob:number
}

interface LL {
    here: MyNode,
    continuance:TravelCost,
    next?:NextLL
}
    

interface StoryProgression {
    outputTxt:string,
    updatedScores:VisibleScores
}

class Story {

    //story progression
    nodes:MyNode[];
    storyProgression:LL[];
    myScores:DynamicScoresOfInterest;
    othersOpinions:OthersOpinions;
    nodeIdx:number;
    gptStorage:string;
    atEntrance:boolean;

    //other things we're tracking
    

    constructor() {
        //first, we need to load in the relevant nodes
        group = shuffle(group);
        group.unshift(troy);
        this.nodes = group.map((g) => {
            g.components = g.components.map((c) => {
                c.status = ["friendly", "hostile", "nuetral"].includes(c.status) ? c.status : "nuetral";
                return c as NodePart;
            })
            return new MyNode(g.entranceDescription, g.components, g.primarySourceText, g.specialInstructions, g.citation)
        });

        //for now, let's explore sequentially but randomly
        this.nodes = shuffle(this.nodes);

        //construct our dummy linked list
        //TODO - these need to interact
        this.storyProgression = this.nodes.map((n, idx) =>  {
            const foodCost = (1+Math.random())*10;
            const shipCost = Math.random() < .5 ? (1+Math.random()) * 2 : 10*Math.random() + Math.random() * 20
            return {
                here: n,
                continuance: {
                    food: foodCost,
                    shipQuality: shipCost,
                    time: Math.max(foodCost/2, shipCost/4)+1
                }
            }
        });
        

        //TODO - make this terminate at ending node
        //TODO - make it begin at the starting node
        this.storyProgression.forEach((ll, idx) => {
            this.storyProgression[idx].next = {
                prob: 1, 
                next: idx < this.storyProgression.length-1 ? this.storyProgression[idx+1] : undefined
            }
        })

        //initialize our scores
        this.myScores = new DynamicScoresOfInterest();

        //intialize important other opinions
        this.othersOpinions = new OthersOpinions();

        //initialize gpt storage to nothing
        this.gptStorage = "";

        //set index to -1
        this.nodeIdx = 0;

        //set self to at entrance of node
        this.atEntrance = true;
    }

    // progressStory(messagesSoFar: MessagesInfo[]):StoryProgression {
    //     //given the messages we have, transition into next state

    //     //get info from gpt

    //     //update nodeIndex if gpt says too

    //     //update otehrsOpinions

    //     //update GPT memory log

    //     //figure out if we died and update scores

    //     //return the next story progression
    // }

    /*
        user prompt:
            onStay => increase time by 1, decrease food
            onContinue => back to travel
            onExplore => prompt GPT

        onTravel => 
            bad weather probability (model 1 for each amount of time)
            on bad weather, determine how much worse everything gets. Ask GPT if anyone interferes to help/hurt after coming up with initial numbers.
                shipQuality, time, food, number of crew, etc. can all change
            bring to new destination
        
        onExplore => GPT decides what to do next
    */



}
export {}
/*
Mapper of states you can end up in w/ some kind of transition probabilities (randomly generate map or something)

*/