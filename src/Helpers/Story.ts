import aeolus from "../NodeData/aeolus.json";
import charydbis_scyllab from "../NodeData/charybdis_scylla.json";
import hydra from "../NodeData/hydra.json";
import lamus from "../NodeData/lamus.json";
import lotus from "../NodeData/lotus.json";
import sirens from "../NodeData/sirens.json";
import troy from "../NodeData/troy.json";
import home from "../NodeData/home.json";
import {MyNode, NodePart, TravelCost, DynamicScoresOfInterest, OthersOpinions, MessagesInfo, VisibleScores, MyNodeInterface, GptExploringOutput} from "../interfaces";
import {troySacrificePrompt, onIslandExplorePrompt, onIslandFoundPrompt, onHomeResponse} from "./StoryHelpers/Prompting";
let group = [aeolus,charydbis_scyllab,hydra,lamus,lotus, sirens];
// let group = [aeolus, lotus];
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
    updatedScores:VisibleScores,
    opinionsArray:OthersOpinions
}

export class Story {

    //story progression
    nodes:MyNode[];
    storyProgression:LL[];
    myScores:DynamicScoresOfInterest;
    othersOpinions:OthersOpinions;
    nodeIdx:number;
    gptStorage:string;
    atEntrance:boolean;
    relevantMessagesIdx:number;
    internalFameScore:number;
    numSuitors:number;
    wonGame:boolean
    //other things we're tracking
    

    constructor() {
        //first, we need to load in the relevant nodes

        const processInputNodeJson = (g:MyNodeInterface):MyNode => {
            g.components = g.components.map((c) => {
                c.status = ["friendly", "hostile", "nuetral"].includes(c.status) ? c.status : "nuetral";
                return c as NodePart;
            })
            return new MyNode(g.entranceDescription, g.components, g.primarySourceText, g.specialInstructions, g.citation)

        }
        group = shuffle(group);
        // group.unshift(troy);
        this.nodes = group.map((g) => { return processInputNodeJson(g); });
        this.nodes = shuffle(this.nodes);
        this.nodes = [processInputNodeJson(troy), ...this.nodes, processInputNodeJson(home)];
        //for now, let's explore sequentially but randomly
        

        //construct our dummy linked list
        this.storyProgression = this.nodes.map((n, idx) =>  {
            const foodCost = (1+Math.random())*10;
            const shipCost = Math.random() < .5 ? (1+Math.random()) * 2 : 10*Math.random() + Math.random() * 20
            return {
                here: n,
                continuance: {
                    food: Math.ceil(foodCost),
                    shipQuality: Math.ceil(shipCost),
                    time: Math.ceil(Math.max(foodCost/2, shipCost/4)+1)
                }
            }
        });
        
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

        //set releavnt messages to nothing so far
        this.relevantMessagesIdx = 0;

        //set internal fame to 0
        this.internalFameScore = 0;

        this.numSuitors = 30;

        this.wonGame = false;

        console.log("this.nodes is ", this.nodes);
    }

    edgeTravel(messagesSoFar: MessagesInfo[]):StoryProgression {
        this.atEntrance = true;
        console.log("my scores is ", this.myScores);
        console.log("Edge travel is ", this.storyProgression[this.nodeIdx].continuance)

        //edge cost increases worse you are
        let multiple = 1;
        if (this.myScores.shipQuality > 50) multiple *= .7;
        if (this.myScores.shipQuality <50) multiple *= 1.25; 
        else if (this.myScores.shipQuality <25) multiple *= 2;

        if (this.myScores.food > 70) multiple *= .7;
        if (this.myScores.food >= 60) multiple *= .75;
        if (this.myScores.food <60) multiple *= 1.25; 
        else if (this.myScores.food <50) multiple *= 2;
        else if (this.myScores.food <10) multiple *= 2.25;

        if (this.myScores.time >50) multiple *= 1.25; 
        else if (this.myScores.time < 10) multiple *= .8;

        this.myScores.changeTime(Math.ceil(multiple*this.storyProgression[this.nodeIdx].continuance.time));
        
        if (this.myScores.changefood(-Math.ceil(multiple*Math.abs(this.storyProgression[this.nodeIdx].continuance.food)))) {
            return {
                outputTxt: "You have run out of food and have died. Please start again",
                updatedScores: this.myScores.getVisibleScores(),
                opinionsArray: this.othersOpinions
            }
        
        }

        if (this.myScores.changeShipQuality(-Math.ceil(multiple*Math.abs(this.storyProgression[this.nodeIdx].continuance.shipQuality)))) {
            return {
                outputTxt: "Your ship has sunk. Please start again",
                updatedScores: this.myScores.getVisibleScores(),
                opinionsArray: this.othersOpinions
            }
        
        };

        //mark messages thru here bc after this is only what pass to gpt
        this.relevantMessagesIdx = messagesSoFar.length-1;
        this.nodeIdx += 1;
        const isSkippable = this.nodeIdx <= this.nodes.length - 1 && !this.nodes[this.nodeIdx].entranceDescription.includes("Charybdis") && !this.nodes[this.nodeIdx].entranceDescription.includes("Sirens");
        return {
            outputTxt: "You continue on your voyage...\n"+this.storyProgression[this.nodeIdx].here.entranceDescription +(isSkippable ? "\nWould you like to stay in your ships (stay), sail onwards (sail), or explore the island (explore)?" : "\nYou must sail past this obstacle"),
            updatedScores: this.myScores.getVisibleScores(),
            opinionsArray: this.othersOpinions
        }
    }

    async progressStory(messagesSoFar: MessagesInfo[], luck:number):Promise<StoryProgression> {

        //if end condition explicitly triggered, return that 
        if (this.nodeIdx === this.nodes.length || this.wonGame) {
            return {
                outputTxt: "Congrats you have won the game. Your final score is " + this.myScores.getFinalScore(),
                updatedScores: this.myScores.getVisibleScores(),
                opinionsArray: this.othersOpinions
            }
        }
        //first are we at troy
        if (this.nodeIdx === 0 && this.atEntrance) {
            console.log("Troy consideration");
            //figure out how much the user wants to sacrifice
            let amount = await troySacrificePrompt(messagesSoFar[messagesSoFar.length-1].message);
            this.myScores.changeGold(-amount);
            if (amount >= 40) {
                this.myScores.changeShipQuality(Math.min(15,Math.floor((amount-40)/2)));
            }

            //figure out favors of gods
            this.othersOpinions.updateSinglePerson("Poseidon", amount >30 ? 2 : Math.max(-3,Math.floor((amount-20)/2)) , "due to sacrifices of " + amount + " gold");

            //edge travel - we don't reutnr this one tho
            const output = this.edgeTravel(messagesSoFar);
            output.outputTxt = `You begin your journey having sacrified ${amount} gold to the gods\n${output.outputTxt}`;

            return output
        }

        //some nodes you can't avoid the entrance
        if (this.nodes[this.nodeIdx].entranceDescription.includes("Charybdis")) this.atEntrance = false;
        else if (this.atEntrance && this.nodeIdx !== this.nodes.length-1) {
            //figure out what to do on the island
            let gptOutput = "";
            if (this.nodeIdx < this.nodes.length-1) gptOutput = await onIslandFoundPrompt(messagesSoFar.map(m=>m.message), luck);
            else gptOutput = "stay";
            console.log("gpt output is ", gptOutput);
            if (gptOutput === "explore") {
                ; // TODO - should make it so don't have to send two requests
            }
            else if (gptOutput === "stay") {
                this.myScores.changeTime(1);
                this.myScores.changefood(-2);
                return {
                    outputTxt: "You wait for the morrow. What would you like to do now?",
                    updatedScores: this.myScores.getVisibleScores(),
                    opinionsArray: this.othersOpinions
                }
            }
            else { //its travel
                return this.edgeTravel(messagesSoFar);
            }
        }

        //get relevant messages
        const relevantMessages = messagesSoFar.slice(this.relevantMessagesIdx);

        let gptResponse:null|GptExploringOutput = null;

        //special case of at home 
        if (this.nodeIdx === this.nodes.length-1) {
            const expandedGptResponse = await onHomeResponse(this.othersOpinions, this.myScores, this.storyProgression[this.nodeIdx].here, relevantMessages, this.gptStorage, luck, this.numSuitors);
            console.log("home response is ", expandedGptResponse);
            if (!expandedGptResponse) {
                return {
                    outputTxt: "The Muses are out of services right now. Please state what you tried to do again",
                    updatedScores: this.myScores.getVisibleScores(),
                    opinionsArray: this.othersOpinions
                }
            }
            this.numSuitors = expandedGptResponse.numSuitorsLeft;
            console.log("num suitors is ", this.numSuitors);
            if (this.numSuitors <= 0 || expandedGptResponse.wonGame) {
                this.wonGame = true;
            }
            gptResponse = expandedGptResponse;
        }
        else {
            //get island explore prompt
            console.log("hitting onIslandExplorePrompt");
            gptResponse = await onIslandExplorePrompt(this.othersOpinions, this.myScores, this.storyProgression[this.nodeIdx].here, relevantMessages, this.gptStorage, luck);
            console.log("[onIslandExplorePrompt] gptResponse is ", gptResponse);
            if (!gptResponse) {
                return {
                    outputTxt: "The Muses are out of services right now. Please state what you tried to do again",
                    updatedScores: this.myScores.getVisibleScores(),
                    opinionsArray: this.othersOpinions
                
                }
            }
        }

        

        //extract what we want to modify from the gpt response
        const {crewStrength, timeChange, toldFriendlyPeopleOfDeeds, additionalDataToPassOn,famousDeedScore, goldGain, isAlive,leftThisPlace, peopleOfInterest,shipQualityChange, whatHappens, foodChange } = gptResponse

        this.othersOpinions.updateEntities(peopleOfInterest.opinions, peopleOfInterest.entities , peopleOfInterest.whys);
        this.gptStorage += "at time " + this.myScores.time + ", " + additionalDataToPassOn + ";";
        if (!isAlive) {
            return {
                outputTxt: whatHappens + "You have died. Please start again",
                updatedScores: this.myScores.getVisibleScores(),
                opinionsArray: this.othersOpinions
            }
        }

        //update what you did here
        this.myScores.changeTime(timeChange);
        const amountTold = toldFriendlyPeopleOfDeeds;
        this.internalFameScore += this.myScores.fame * (amountTold/10);
        this.myScores.changeFame(famousDeedScore);
        this.myScores.changeGold(goldGain);

        //update scores where you could die
        if (this.myScores.changefood(foodChange)) {
            return {
                outputTxt: whatHappens + "You have run out of food and have died. Please start again",
                updatedScores: this.myScores.getVisibleScores(),
                opinionsArray: this.othersOpinions
            }
        
        };
        if (this.myScores.changeNumCrew(crewStrength)) {
            return {
                outputTxt: whatHappens + "All members of your crew have died. Please start again",
                updatedScores: this.myScores.getVisibleScores(),
                opinionsArray: this.othersOpinions
            }
        };

        if (this.myScores.changeShipQuality(shipQualityChange)) {
            return {
                outputTxt: whatHappens + "Your ship has been destroyed. Please start again",
                updatedScores: this.myScores.getVisibleScores(),
                opinionsArray: this.othersOpinions
            }
        }
        
        if (leftThisPlace) {
            this.atEntrance = true;
            return this.edgeTravel(messagesSoFar);
        }

        this.atEntrance = false;
        return {
            outputTxt: whatHappens,
            updatedScores: this.myScores.getVisibleScores(),
            opinionsArray: this.othersOpinions
        }
    }
}
