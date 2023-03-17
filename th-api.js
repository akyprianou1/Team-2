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
    // todo add your own code ...

}

function sessionGame() {

    let session = localStorage.getItem("SessionID");
    let session_url = "https://codecyprus.org/th/api/question?session=" + session;
    console.log(session_url);

    fetch(session_url)
        .then(response => response.json())
        .then(jsonObject => {
           console.log(jsonObject);

            if (jsonObject.status === "OK") {
                document.getElementById("question").innerHTML = jsonObject.questionText;
            }
            else {
                alert("Error!");
            }


        });
}




function answerGiven(answer){
    let session = localStorage.getItem("GameSession");
    let answer_url = "https://codecyprus.org/th/api/answer?session=" + session +"&answer="+answer;
    console.log(answer_url);
    fetch(answer_url)
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);
        });
}





function startGame() {
    const params = new URLSearchParams(location.search);
    let uuid = null;

    let playerNameField = document.getElementById("playerName");
    let appName = "Team2-App";

    if (params.has("treasureHuntID")) {
        uuid = params.get("treasureHuntID");
        console.log("TreasureHuntID");
    }
    else {
        alert("No UUID");
    }

    let playerName = playerNameField.value;
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



            //Start will return session ID
            // localStorage.setItem("GameSession", );
            //Save session ID to local storage...

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