let inventory = {
    hammer: false,
    health: 3,
    coins: 0,
    tickets: 0
};

let machineA = {
    location: "Stage",
    turn_count: 3
} // TODO: Animatronic starts dormant for 3 turns and doesn't attack the player or move

class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);    
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]
        this.engine.show(locationData.Body + "<p>");

        //console.log(locationData);
        if(locationData.Choices) {
            for(let choice of locationData.Choices) {
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("The end.")
        }
        
        if(locationData.Actions){
            for(let action of locationData.Actions) {
                this.engine.addAction(action.Text, action, key);
            }
        }        
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            if(choice.Target === "Outside" && inventory.hammer == false) {
                this.engine.show("You're not strong enough to open the locked door. Maybe you can find something to break it down?");
                this.engine.gotoScene(Location, "Entrance");
            }
            else {      
                this.engine.gotoScene(Location, choice.Target);

                // Animatronic will attack upon arriving in same location
                if(choice.Target === machineA.location){
                    this.handleAttack();
                }  

                this.handleMove();                  
            }
        } else {
            this.engine.gotoScene(End);
        }
    }

    handleAction(action, key) {
        if(action) {
            this.engine.show("&gt; "+action.Text);
            if(action.Target === "Inventory") {
                this.engine.show("Coins: " + inventory.coins + " Tickets: " + inventory.tickets + " Health: " + inventory.health +"<p>");}
            
            else if(action.Target === "Search") {
                this.searchRoom(key);}
            
            else if(action.Target === "Games") {
                this.playGame(key);}
            
            else if(action.Target === "TV"){
                this.engine.show("There appears to be an animatronic stalking the " + this.engine.storyData.Locations[machineA.location].LongName + ". Best to avoid that area for now.<p>");}
            
            else{
                this.buyItem(action.Target)}

            // Prevent gotoScene if at GameOver
            if(inventory.health > 0){
                this.engine.gotoScene(Location, key);}
        }
    }

    buyItem(action){
        if(action === "Buy_Hammer") {
            if(inventory.tickets >= 10) {
                this.engine.show("You bought the hammer!");
                inventory.tickets -= 10;
                inventory.hammer = true; 
            }
            else { 
                this.engine.show("You don't have enough tickets to get the hammer. Might have to play some games.<p>");
            }
        }
    }
    
    playGame(key){
        if(inventory.coins > 0){
            let tickets_earned = Math.floor(Math.random() * 4) + 1;
            this.engine.show("You inserted a coin into the machine and played a round of Skeeball.")
            this.engine.show("You won " + tickets_earned + " tickets!<p>");
            inventory.tickets += tickets_earned;
            inventory.coins--;

            if(key == machineA.location){
                this.handleAttack(key);
            }
            this.handleMove();
        }
        else{
            this.engine.show("You need to find more coins to play this game.<p>");
        }        
    }

    searchRoom(key){
        //1/3 chance to find a coin using search
        if(Math.floor(Math.random() * 2) + 1 === 1){
            inventory.coins++;
            this.engine.show("You found a coin!<p>");
            }
            else{
                this.engine.show("You didn't find anything.<p>")
        }

        if(key == machineA.location){
            this.handleAttack(key);
        }
        this.handleMove();
    }

    handleAttack(key){
        inventory.health--;
        if(inventory.health == 0){
            this.engine.show("<p class ='danger'>An animatronic attacks you while you're already weak! You can't defend against it!</p>");
            this.engine.gotoScene(GameOver);
        }
        else if(key == machineA.location){
            this.engine.show("<p class='danger'>An animatronic swipes at you doing a bit of damage! Probably shouldn't be searching around the same room it's in.</p>");
        }
        else{
            this.engine.show("<p class='danger'>An animatronic swipes at you doing a bit of damage! Better get out of here quickly!</p>");
        }
    }    

    handleMove(){
        machineA.turn_count--;
        if (machineA.turn_count === 0) {
            this.engine.show("An Animatronic is on the move!");
            machineA.turn_count = 3;

            let randomChoice = "";
            console.log(randomChoice);
            do{
                // Get the choices array for the current location
                let choices = this.engine.storyData.Locations[machineA.location].Choices;
                // Choose a random index from the choices array
                let randomIndex = Math.floor(Math.random() * choices.length);    
                // Get the target location from the chosen index
                randomChoice = choices[randomIndex];    
                // Set the machine's location to the target of the random choice
                console.log(randomChoice);
            }
            while(randomChoice.Target === "Outside") //Prevents the machine from going outside the map
            machineA.location = randomChoice.Target;
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

class GameOver extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.GameOver);
    }
}

Engine.load(Start, 'myStory.json');