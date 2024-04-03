
//this is short enough that we can get away with using arrays

function clipScore(n:number) {
    if (n < -10) return -10;
    if (n > 10) return 10;
    return n;
}

export interface Opinions {
    entities: string[];
    opinions: number[];
    whys:string[]
}
export class OthersOpinions implements Opinions {
    entities: string[];
    opinions: number[];
    whys:string[]

    constructor() {
        this.entities = ["crew", "Poseidon"];
        this.opinions = [10, 0];
        this.whys = ["you are generally well liked by the crew", "doesn't have an opinion of you yet"];
    }

    updateEntities(newScores:number[], newEntities:string[], newWhys:string[]): void {

        newEntities.forEach((entityName, idx) => {
            const thisWhy = newWhys[idx];
            const thisScore = clipScore(newScores[idx]);
            const matchIdx = this.entities.indexOf(entityName);
            if (matchIdx !== -1) {
                this.whys[matchIdx] += "; later " + thisWhy;
                this.opinions[matchIdx] = thisScore;;
            }
            else {
                this.entities.push(entityName);
                this.opinions.push(thisScore);
                this.whys.push(thisWhy);
            }
        });
    }

    getOpinions(): string {
        const opiononsToJoin:string[] = [];
        this.entities.forEach((entity, idx) => {
            const why = this.whys[idx];
            const opinion = this.opinions[idx];
            opiononsToJoin.push("Entity "  + entity + " has an opinion of " + opinion + " due to: " + why);

        })
        return opiononsToJoin.join("\n");
    }
}

interface PossibleNodePartGainInstance {
    amount:number,
    how:string
}

//basic stuff this has. use as guideline. only improve if the story says (i.e. if food is positive but they don't stay for dinner, they don't get a food increase)
export interface NodePartBaseBonuses {
    food:PossibleNodePartGainInstance,
    fame:PossibleNodePartGainInstance,
    gold:PossibleNodePartGainInstance,
    shipQuality:PossibleNodePartGainInstance
}

export interface TravelCost {
    food:number;
    shipQuality:number;
    time:number;
}


export interface MessagesInfo {
    purpose?: string;
    message: string;
    options?: string[];
    sender: string;
  }
  
export interface VisibleScores {
    food:number;
    shipQuality:number;
    time:number;
    numCrew:number;
}

export interface ScoresOfInterest {
    fame:number;
    food:number;
    gold:number;
    shipQuality:number;
    time:number;
    numCrew:number;
}

export class DynamicScoresOfInterest implements ScoresOfInterest{
    fame:number;
    food:number;
    gold:number;
    shipQuality:number;
    time:number;
    numCrew:number;

    constructor() {
        this.fame = 0; this.food = 100; this.gold = 100; this.shipQuality = 100; this.time = 0; this.numCrew = 20;
    }

    //each of these change functions will change and return if something goes wrong
    changefood(amountChange:number):boolean {
        this.food -= amountChange;
        if (this.food <0) return true;
        return false;
    }

    changeGold(amountChange:number):boolean {
        this.gold += amountChange;
        return false;
    }

    changeFame(amountChange:number):boolean {
        this.fame +=amountChange; return false;
    }

    //ship crashes
    changeShipQuality(amountChange:number):boolean {
        this.shipQuality += amountChange;
        if (this.shipQuality < 0) return true;
        return false;
    }

    changeTime(amountChange:number):boolean {
        this.time += amountChange;
        return false;
    }

    changeNumCrew(amountChange:number) {
        this.numCrew += amountChange;
        if (this.numCrew <0) return true;
        return false;
    }
}

export interface NodePart {
    // status:"friendly"|"nuetral"|"hostile";
    status:string
    // fightingStrength:0|1|2|3|4|5;
    // intelligence:0|1|2|3|4|5;
    // agression:0|1|2|3|4|5;
    fightingStrength:number;
    intelligence:number;
    agression:number;
    explorerDescription:string;
    exhibitsXenia:boolean;
    who:string;
    fightingDetails: string;
    sampleBenefits: NodePartBaseBonuses
}

//island
export interface MyNodeInterface {
    entranceDescription:string;
    components:NodePart[];
    primarySourceText: string;
    specialInstructions:string;
    citation: string;
}
export class MyNode implements MyNodeInterface {
    entranceDescription:string;
    components:NodePart[];
    primarySourceText: string;
    specialInstructions:string;
    citation: string;

    constructor(entranceDescription:string, components:NodePart[], primarySourceText:string, specialInstructions:string, citation:string) {
        this.entranceDescription = entranceDescription;
        this.components = components;
        this.primarySourceText = primarySourceText;
        this.specialInstructions = specialInstructions;
        this.citation = citation;
    }

    getEntranceDescription():string {
        return this.entranceDescription;
    }

    getNodePartString(np:NodePart):string {
        let st = np.who;
        st +="\n\tstatus:" + np.status;
        st +="\n\tfighting strength:" + np.fightingStrength;
        st +="\n\tintelligence:" + np.intelligence;
        st +="\n\tagression:" + np.agression;
        st +="\n\tdescription:" + np.explorerDescription;
        st +="\n\tfighting details:" + np.fightingDetails;
        st +="\n\texhibits xenia::" + np.exhibitsXenia;
        return st;
    }

    getNodeString():string {
        let st = "(base description) " + this.getEntranceDescription() + "\n";
        for (const nodePart of this.components) {
            st += this.getNodePartString(nodePart);
        }
        return st;
    }
};