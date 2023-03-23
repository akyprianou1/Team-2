const TH_BASE_URL = "https://codecyprus.org/th/api/"; // the true API base url
const TH_TEST_URL = "https://codecyprus.org/th/test-api/"; // the test API base url

/**
 * An asynchronous function to realize the functionality of getting the available 'treasure hunts' (using /list) and
 * processing the result to update the HTML with a bullet list with the treasure hunt names and descriptions. Also,
 * for each treasure hunt in the bullet list, a link is shown to trigger another function, the 'select'.
 * @return {Promise<void>}
 */
async function doList() {

    // call the web service and await for the reply to come back and be converted to JSON
    const reply = await fetch(TH_BASE_URL + "list");
    const json = await reply.json();

    // identify the spinner, if available, using the id 'loader'...
    let spinner = document.getElementById("loader");
    // .. and stop it (by hiding it)
    spinner.hidden = true;

    // access the "treasureHunts" array on the reply message
    let treasureHuntsArray = json.treasureHunts;
    let listHtml = "<ul>"; // dynamically form the HTML code to display the list of treasure hunts
    for(let i = 0; i < treasureHuntsArray.length; i++) {
        listHtml += // each treasure hunt item is shown with an individual DIV element
            "<li>" +
            "<b>" + treasureHuntsArray[i].name + "</b><br/>" + // the treasure hunt name is shown in bold...
            "<i>" + treasureHuntsArray[i].description + "</i><br/>" + // and the description in italics in the following line
            "<a href='start.html?treasureHuntID=" + treasureHuntsArray[i].uuid + "'>Start</a>" + // and the description in italics in the following line
            "</li>";
    }
    listHtml += "</ul>";
    // update the DOM with the newly created list
    document.getElementById("treasureHunts").innerHTML = listHtml;
}

/**
 * This function is called when a particular treasure hunt is selected. This is merely a placeholder as you're expected
 * to realize this function-or an equivalent-to perform the necessary actions after a treasure hunt is selected.
 *
 * @param uuid this is the argument that corresponds to the UUID of the selected treasure hunt.
 * @return {Promise<void>}
 */
async function select(uuid) {
    // For now just print the selected treasure hunt's UUID. Normally, you're expected to guide the user in entering
    // their name etc. and proceed to calling the '/start' command of the API to start a new session.
    console.log("Selected treasure hunt with UUID: " + uuid);
}

function getQuestion() {

    let session = localStorage.getItem("SessionID");
    let session_url = "https://codecyprus.org/th/api/question?session=" + session;
    console.log(session_url);

    fetch(session_url)
        .then(response => response.json())
        .then(jsonObject => {
           console.log(jsonObject);

            if (jsonObject.status === "OK") {
                document.getElementById("question").innerHTML = jsonObject.questionText;
                if(jsonObject.canBeSkipped == true)
                {
                    document.getElementById('skip').style.visibility = 'visible';
                }
                else
                {
                    document.getElementById('skip').style.visibility = 'hidden';
                }
                if(jsonObject.completed == true)
                {
                    location.href = "leaderboard.html";
                }
            }
            else {
                alert("Error!");
            }
        });
}




function answerGiven() {
    let session = localStorage.getItem("SessionID");
    let answer = document.getElementById("answerGiven");

    if (answer.value === "" || answer.value == null) {
        alert("Please provide an answer.");
        return;
    }

    let answer_url = "https://codecyprus.org/th/api/answer?session=" + session + "&answer=" + answer.value;
    console.log(answer_url);
    fetch(answer_url)
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);

            if (jsonObject.status === "OK") {
                //Update score
                let score = Number(localStorage.getItem("Score"));
                if (score == null){
                    score = 0;
                }
                score += jsonObject.scoreAdjustment;
                localStorage.setItem("Score", score);
                document.getElementById("Score").innerHTML = "Score: " + score;


                //Show message
                alert(jsonObject.message);

                if (jsonObject.correct) {
                    if (jsonObject.completed) {
                        location.href = "leaderboard.html";
                    }
                    else {
                        getQuestion();
                        answer.value = "";
                    }
                }
            } else {
                alert("Error: " + jsonObject.errorMessages[0]);
            }
        });
}


function startGame() {
    const params = new URLSearchParams(location.search);
    let uuid = null;
    let playerNameField = document.getElementById("playerName");
    let appName = "Team2-App";

    localStorage.setItem("Score", "0");  //reset score

    if (params.has("treasureHuntID")) {
        uuid = params.get("treasureHuntID");
        console.log("TreasureHuntID");
    }
    else {
        alert("No UUID");
    }

    let playerName = playerNameField.value;
    localStorage.setItem("name", playerName);
    let url = "https://codecyprus.org/th/api/start?player=" + playerName + "&app=" + appName + "&treasure-hunt-id=" + uuid;
    fetch(url)
        .then(response => response.json())
        .then(jsonObject => {

            if (jsonObject.status === "OK") {
                const sessionID = jsonObject.session;
                const numOfQuestions = jsonObject.numOfQuestions;
                localStorage.setItem("SessionID", sessionID );
                localStorage.setItem("numOfQuestions", numOfQuestions);
                location.href = "session.html";
            }
            else {
                alert("Error!");
            }

        });
}


function leaderBoard(){
    let session = localStorage.getItem("SessionID");
    let session_url = "https://codecyprus.org/th/api/leaderboard?session=" + session + "&sorted";

    let player_score = "https://codecyprus.org/th/api/leaderboard?session=" + session;

    console.log(session_url);
    var table = document.getElementById("table");
    fetch(session_url)
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);

            if (jsonObject.status === "OK") {
                let list_length = (jsonObject.leaderboard).length;
                console.log("List: ", list_length);   //list length


                for (let i = 0; i < 30; i++)
                {
                    var row = table.insertRow( i + 1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    cell1.innerHTML = Number(i+1)+". " +jsonObject.leaderboard[i].player;
                    cell2.innerHTML = jsonObject.leaderboard[i].score;
                    cell3.innerHTML = jsonObject.leaderboard[i].completionTime;
                }

                for (let i = 0; i < list_length; i++)
                {
                    if (localStorage.getItem("name") == jsonObject.leaderboard[i].player )
                    {
                        var row = table.insertRow(31);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        cell1.innerHTML = Number(i+1)+". " + jsonObject.leaderboard[i].player;
                        cell2.innerHTML = jsonObject.leaderboard[i].score;
                        cell3.innerHTML = jsonObject.leaderboard[i].completionTime;
                    }
                }
            }
            else {
                    alert("Error!");
                }
        });

}


function skipMaybe(){
    let session = localStorage.getItem("SessionID");
    let session_url = "https://codecyprus.org/th/api/skip?session=" + session;
    console.log(session_url);

    fetch(session_url)
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);

            if (jsonObject.status === "OK") {
                alert("Question Skipped");
                let score = Number(localStorage.getItem("Score"));
                if (score == null){
                    score = 0;
                }
                score += Number(jsonObject.scoreAdjustment);
                localStorage.setItem("Score", score);
                document.getElementById("Score").innerHTML = "Score: " + score;

                getQuestion();
            }
            else {
                alert("Error!");
            }
        });
}



function locationGiven(){
    let session = localStorage.getItem("GameSession");
    let location = "https://codecyprus.org/th/api/location?session="+ session;
    console.log(location);
    fetch(location)
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);
        });
}