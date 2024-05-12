import {Default} from "./loadBlockchain.js";
import {Election} from "./Election.js";

export var ElectionData = {
    // get() is a loader function, to run loadElections() function.
    get: async () => {
        await ElectionData.loadElections();
        await ElectionData.loadElectionDetails();
    },

    // Loading deployed election contracts in Default.election array
    loadElections: async () => {
        ElectionData.elections = [];
        ElectionData.electionCount = await Default.MainContract.electionId();
        for (var i = 0; i < ElectionData.electionCount; i++) {
            var electionAddress = await Default.MainContract.Elections(i);
            var election = await new Election(electionAddress);
            await election.init();
            ElectionData.elections.push(election);
        }
    },

    // This function will update the page with election details
    loadElectionDetails: async () => {
        $("#elections").empty(); // Clear previous content
        for (var i = 0; i < ElectionData.electionCount; i++) {
            var details = await ElectionData.elections[i].getDetails();
            var imagePath = `/assets/image${i + 1}.jpg`; // Image path
            var votedMessage = details.hasVoted
                ? `<div style="font-weight: bold; color: green;">You Voted</div>`
                : "";
            var candidatesHTML = details.candidates.map((candidate, index) => `
      <b>${candidate.name} (${candidate.voteCount})</b>
    `).join(" vs ");

            var votingOptionsHTML = details.candidates.map((candidate, index) => `
      <input type='radio' name="${details.address}" id="${details.address}${index}" onclick="ElectionData.elections[${i}].castVote(${index})">
      <label for="${details.address}${index}">${candidate.name}</label><br>
    `).join("");


            var electionComponent = `
            <div class="election-section">
                <b class="election-name">${details.name}</b>
                <div class="row mt-3">
                    <div class="col-md-4">
                        <img src="${imagePath}" alt="Image for ${
                details.name
            }" class="img-fluid">
                    </div>
                    <div class="col-md-8">
                        <p>${details.description}</p>
                        <div> Current statistics: </div>
                                    <div class="text-muted">${candidatesHTML}</div>
                    </div>
                </div>
                ${votedMessage}
                ${
                !details.hasVoted
                    ? `
                    <div >Choose your candidate:</div>
                    <div>${votingOptionsHTML}</div>`
                    : ""
            }
            </div>`;
            $("#elections").append(electionComponent);
        }
    },

    // Function to create (deploy) election on the network
    createElection: async (details, candidates) => {
        await Default.MainContract.createElection(details, candidates, {
            from: Default.account,
        });
        ElectionData.get();
    },
};

window.ElectionData = ElectionData;
