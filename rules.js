let inventory = {
    hammer: false,
    health: 3,
    coins: 0,
    tickets: 0,
    location: "Security"
};

let machines = [
    { id: 'A', location: 'Stage', active: true, turn_count: 3 },
    { id: 'B', location: 'Kitchen', active: false, turn_count: 3 },
    { id: 'C', location: 'Play', active: false, turn_count: 3 },
];


let machineA = {
    location: "Stage",
    turn_count: 3
}
let machineB = {
    location: "Kitchen",
    turn_count: 3,
    active: false
}
let machineC = {
    location: "Play",
    turn_count: 3,
    active: false
}

class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.show("Set Difficulty");
        this.engine.addChoice("Easy", "Easy");
        this.engine.addChoice("Normal", "Normal");
        this.engine.addChoice("Hard", "Hard");
        //this.engine.addChoice("Begin the story");
    }

    handleChoice(difficulty) {
        if (difficulty === "Normal") {
            machines[1].active = true;
        } else if (difficulty === "Hard") {
            machines[1].active = true;
            machines[2].active = true;
        }
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]
        this.engine.show(locationData.Body + "<p>");

        if (locationData.Choices) {
            for (let choice of locationData.Choices) {
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("The end.")
        }

        if (locationData.Actions) {
            for (let action of locationData.Actions) {
                this.engine.addAction(action.Text, action, key);
            }
        }
    }

    handleChoice(choice) {
        if (choice) {
            this.engine.show("&gt; " + choice.Text);
            if (choice.Target === "Outside" && inventory.hammer == false) {
                this.engine.show(this.engine.storyData.Locations.Entrance.Locked);
                this.engine.gotoScene(Location, "Entrance");
            }
            else {
                this.engine.gotoScene(Location, choice.Target);
                inventory.location = choice.Target;

                // Animatronic will attack upon arriving in same location
                this.handleAttack();
                this.handleMove();
            }
        } else {
            if (inventory.health > 0) {
                this.engine.gotoScene(End);
            }
        }
    }

    handleAction(action, key) {
        if (action) {
            this.engine.show("&gt; " + action.Text);
            if (action.Target === "Inventory") {
                this.engine.show("Coins: " + inventory.coins + " Tickets: " + inventory.tickets + " Health: " + inventory.health + "<p>");
            }

            else if (action.Target === "Search") {
                this.searchRoom();
            }

            else if (action.Target === "Games") {
                this.playGame();
            }

            else if (action.Target === "TV") {
                for (let machine in machines) {
                    if (machines[machine].active) {
                        this.engine.show("There appears to be an animatronic stalking the " + this.engine.storyData.Locations[machines[machine].location].LongName + ". Best to avoid that area for now.<p>");
                    }
                }
            }
            else if (action.Target === "Notice") {
                this.engine.show(this.engine.storyData.Introduction);
            }
            else {
                this.buyItem(action.Target)
            }

            // Prevent gotoScene if at GameOver
            if (inventory.health > 0) {
                this.engine.gotoScene(Location, key);
            }
        }
    }

    buyItem(action) {
        if (action === "Buy_Hammer") {
            if (inventory.tickets >= 10) {
                //this.engine.show("You bought the hammer!");
                this.engine.show(this.engine.storyData.Locations.Prize.Items.Have_Money);
                inventory.tickets -= 10;
                inventory.hammer = true;
            }
            else {
                this.engine.show(this.engine.storyData.Locations.Prize.Items.Poor);
            }
        }
    }

    playGame() {
        if (inventory.coins > 0) {
            let tickets_earned = Math.floor(Math.random() * 4) + 1;
            this.engine.show(this.engine.storyData.Locations[inventory.location].Coins_Use);
            this.engine.show("You won " + tickets_earned + " tickets!<p>");
            inventory.tickets += tickets_earned;
            inventory.coins--;

            this.handleAttack();
            this.handleMove();
        }
        else {
            this.engine.show(this.engine.storyData.Locations[inventory.location].Coins_Need);
        }
    }

    searchRoom() {
        //1/3 chance to find a coin using search
        if (Math.floor(Math.random() * 2) + 1 === 1) {
            inventory.coins++;
            this.engine.show("You found a coin!<p>");
        }
        else {
            this.engine.show("You didn't find anything.<p>")
        }
        this.handleAttack();
        this.handleMove();
    }

    handleAttack() {
        for (let attack in machines) {
            console.log(machines[attack].location);
            if (machines[attack].active && inventory.location === machines[attack].location) {
                inventory.health--;

                if (inventory.health == 0) {
                    this.engine.show(this.engine.storyData.Animatronic.GameOver.Body);
                    // Remove all buttons from the actions container since they wont remove themselves
                    while (this.engine.actionsContainer.firstChild) {
                        this.engine.actionsContainer.removeChild(this.engine.actionsContainer.firstChild);
                    }
                    this.engine.gotoScene(GameOver);
                }
                else if (inventory.location === machines[attack].location) {
                    this.engine.show(this.engine.storyData.Animatronic.Stay.Body);
                }
                else {
                    this.engine.show(this.engine.storyData.Animatronic.Attack.Body);
                }
            }
        }
    }

    handleMove() {
        for (let move in machines) {
            if (machines[move].active) {

                machines[move].turn_count--;
                if (machines[move].turn_count == 0 && inventory.health > 0) {
                    //inventory.health prevents message of movement from appearing during GameOver
                    this.engine.show(this.engine.storyData.Animatronic.Moving.Body);
                    machines[move].turn_count = 3;

                    let randomChoice = "";
                    do {
                        // Get the choices array for the current location
                        let choices = this.engine.storyData.Locations[machines[move].location].Choices;
                        // Choose a random index from the choices array
                        let randomIndex = Math.floor(Math.random() * choices.length);
                        // Get the target location from the chosen index
                        randomChoice = choices[randomIndex];
                        // Set the machine's location to the target of the random choice
                    }
                    while (randomChoice.Target === "Outside") //Prevents the machine from going outside the map
                    machines[move].location = randomChoice.Target;

                    if (inventory.location === machines[move].location) {
                        this.engine.show(this.engine.storyData.Animatronic.Arrived.Body);
                    }
                }
            }
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
        this.engine.show(this.engine.storyData.Locations.GameOver.Body);
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');