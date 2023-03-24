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

    let session = localStorage.getItem("SessionID");   // get session id from local storage
    let session_url = "https://codecyprus.org/th/api/question?session=" + session;  // make the url
    console.log(session_url);

    fetch(session_url)      // fetch data from the url
        .then(response => response.json())
        .then(jsonObject => {
           console.log(jsonObject);

            if (jsonObject.status === "OK") {       // if server status is okay
                document.getElementById("question").innerHTML = jsonObject.questionText;      // get question and show it in the box with id= question
                if(jsonObject.canBeSkipped == true)     // if the question can be skipped then show the skip button
                {
                    document.getElementById('skip').style.visibility = 'visible';
                }
                else        // if question can not be skipped then hide buttom
                {
                    document.getElementById('skip').style.visibility = 'hidden';
                }
                if(jsonObject.completed == true)        // if all questions are finished then proceed to the leaderboard page
                {
                    location.href = "leaderboard.html";
                }
            }
            else {
                alert("Error!");  // is server status is not okay then show an error
            }
        });
}




function answerGiven() {
    let session = localStorage.getItem("SessionID");  // get session id from the local storage
    let answer = document.getElementById("answerGiven");    // get answer given from local storage

    if (answer.value === "" || answer.value == null) {      // if no answer was given then show an error and to try again
        alert("Please provide an answer.");
        return;
    }

    let answer_url = "https://codecyprus.org/th/api/answer?session=" + session + "&answer=" + answer.value;  // make url to check answer
    console.log(answer_url);
    fetch(answer_url)  // get data from the url
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);

            if (jsonObject.status === "OK") {       // if server status is okay
                //Update score
                let score = Number(localStorage.getItem("Score")); // get score from the local storage
                if (score == null){     // if the score has not been initialized then initialize score to 0
                    score = 0;
                }
                score += jsonObject.scoreAdjustment;        // update score accordingly
                localStorage.setItem("Score", score);       // save the score in the local storage
                document.getElementById("Score").innerHTML = "Score: " + score; // show updated score


                //Show message
                alert(jsonObject.message);

                if (jsonObject.correct) {
                    if (jsonObject.completed) {  // if all questions are done proceed to leaderboard
                        location.href = "leaderboard.html";
                    }
                    else {
                        getQuestion();      // else get question
                        answer.value = "";  // and reset the answer field
                    }
                }
            } else {
                alert("Error: " + jsonObject.errorMessages[0]); // show error if server not okay
            }
        });
}


function startGame() {
    const params = new URLSearchParams(location.search);
    let uuid = null;        // treasure hunt id initialized
    let playerNameField = document.getElementById("playerName");   // get player Name
    let appName = "Team2-App";                  // fixed app name

    localStorage.setItem("Score", "0");  // initialized/reset score

    if (params.has("treasureHuntID")) {   // get treasure hunt id if it exists
        uuid = params.get("treasureHuntID");
        console.log("TreasureHuntID");
    }
    else {
        alert("No UUID");   // alert that there is no treasure hunt
    }

    let playerName = playerNameField.value;
    localStorage.setItem("name", playerName);   //save player name in local storage
    let url = "https://codecyprus.org/th/api/start?player=" + playerName + "&app=" + appName + "&treasure-hunt-id=" + uuid;   // get url to pull data from server
    fetch(url)
        .then(response => response.json())
        .then(jsonObject => {

            if (jsonObject.status === "OK") {           //if server status is okay
                const sessionID = jsonObject.session;       // get session id
                const numOfQuestions = jsonObject.numOfQuestions;       // get number of questions
                localStorage.setItem("SessionID", sessionID );          // save session id in local storage
                localStorage.setItem("numOfQuestions", numOfQuestions);  // save number of questions in local storage
                location.href = "session.html";         // after we fetch session id we continue to the next page with the session
            }
            else {
                alert("Error!");        // message alert in case of error
            }

        });
}


function leaderBoard(){
    let session = localStorage.getItem("SessionID");      // pull session id
    let session_url = "https://codecyprus.org/th/api/leaderboard?session=" + session + "&sorted";  // get url for the session id

    console.log(session_url);
    var table = document.getElementById("table");       // get to the table
    fetch(session_url)                      // fetch data from the url
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);

            if (jsonObject.status === "OK") {           //if server status is okay
                let list_length = (jsonObject.leaderboard).length;      // pull the number of players in the scoreboard
                console.log("List: ", list_length);   //list length


                for (let i = 0; i < 30; i++)            // for loop to get the first top 30 players
                {
                    var row = table.insertRow( i + 1);        // insert row in the premade table
                    var cell1 = row.insertCell(0);              // insert cells in the row we made
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    cell1.innerHTML = Number(i+1)+". " +jsonObject.leaderboard[i].player;               // add respective data to each cell
                    cell2.innerHTML = jsonObject.leaderboard[i].score;
                    cell3.innerHTML = jsonObject.leaderboard[i].completionTime;
                }

                for (let i = 0; i < list_length; i++)
                {
                    if (localStorage.getItem("name") == jsonObject.leaderboard[i].player )
                    {
                        var row = table.insertRow(31);       // insert row in the premade table
                        var cell1 = row.insertCell(0);       // insert cells in the row we made
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        cell1.innerHTML = Number(i+1)+". " + jsonObject.leaderboard[i].player;      // add respective data to each cell
                        cell2.innerHTML = jsonObject.leaderboard[i].score;
                        cell3.innerHTML = jsonObject.leaderboard[i].completionTime;
                    }
                }
            }
            else {
                    alert("Error!");          // error if server status is not ok
                }
        });

}


function skipMaybe(){
    let session = localStorage.getItem("SessionID"); // pull session id from the local storage
    let session_url = "https://codecyprus.org/th/api/skip?session=" + session;  // make url for the skip button
    console.log(session_url);

    fetch(session_url)      // fetch data from the made url
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);

            if (jsonObject.status === "OK") {   //if server data is okay
                if (confirm("Are you sure you want to skip the question?") == true) {
                    alert("Question Skipped");
                    let score = Number(localStorage.getItem("Score"));      // pull score from the local storage
                    if (score == null){         // if there is no score, initialized score value to 0
                        score = 0;
                    }
                    score += Number(jsonObject.scoreAdjustment);      // adjust score
                    localStorage.setItem("Score", score);               // save score in the local storage
                    document.getElementById("Score").innerHTML = "Score: " + score;    // show/update score as you play

                    getQuestion();      // get the next question
                } else {
                    alert("You canceled the skip!");
                }

            }
            else {
                alert("Error!");    // show error in case server status is not okay
            }
        });
}



function locationGiven(){                                   // LOCATION PROTOTYPE
    let session = localStorage.getItem("GameSession");
    let location = "https://codecyprus.org/th/api/location?session="+ session;
    console.log(location);
    fetch(location)
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);
        });
}