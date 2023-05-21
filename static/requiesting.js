
function changeConferenceJoinAccess(conference_id, vidtoken, isBlocked) {
    let url = `${backendURL}/conferences/${conference_id}/` + (isBlocked ? "prohibit_joining" : "allow_joining")
    console.log(url, isBlocked)
    return fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": vidtoken
                }
            }).then(r => {
                if (r.status !== 200) {
                    return getAPIError(r.status);
                }
                return r.json().then(data => {
                    console.log("data" + data);
                    return data;
                })
    })
}


function finishConference(conference_id, vidtoken) {
    let url = `${backendURL}/conferences/${conference_id}/finish`;
    console.log(url)
    return fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": vidtoken
                }
            }).then(r => {
                if (r.status !== 200) {
                    return getAPIError(r.status);
                }
                return r.json().then(data => {
                    console.log("data" + data);
                    return data;
                })
    })
}