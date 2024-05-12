import { Default } from "./loadBlockchain.js";
import { Election } from "./Election.js";

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
                        <div class="text-muted">
                            
                            <b>${details.candidates[0].name} (${
        details.candidates[0].voteCount
      })</b> vs
                            <b>${details.candidates[1].name} (${
        details.candidates[1].voteCount
      })</b>
                        </div>
                    </div>
                </div>
                ${votedMessage}
                ${
                  !details.hasVoted
                    ? `
                    <div >Choose your candidate:</div>
                    <div>
                        <input type='radio' name=${details.address} id="${details.address}0" onclick="ElectionData.elections[${i}].castVote(0)">
                        <label for="${details.address}0">${details.candidates[0].name}</label><br>
                        <input type='radio' name=${details.address} id="${details.address}1" onclick="ElectionData.elections[${i}].castVote(1)">
                        <label for="${details.address}1">${details.candidates[1].name}</label>
                    </div>`
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
