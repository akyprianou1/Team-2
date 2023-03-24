function handleTestList(caller) {
    //handleList(caller, true);
    console.log(caller);
    if ((Number(caller)<=Number(0))||(isNaN(caller)))
    {
        caller = 10;
    }
    let limit = "number-of-ths="+ caller;
    let url = "https://codecyprus.org/th/test-api/list?" + limit;
    console.log(url);
    fetch(url)      // fetch data from the url
        .then(response => response.json())
        .then(jsonObject => {
            console.log(jsonObject);

            if (jsonObject.status === "OK") {
                console.clear();
                console.log(jsonObject.treasureHunts);
                document.getElementById("treasureHunts").innerHTML = console.log(jsonObject.treasureHunts);
            }
            else
            {
                alert("Error");
            }
        });
}

function handleTestStart(caller) {
    let params = { "player": "INACTIVE" }; // explicitly request an error
    handleStart(params, caller, true);
}


function handleTestQuestion(caller){}


function handleTestAnswer(caller){}


function handleTestScore(caller){}


function handleTestLeaderboard(caller){}