var isFormVisible = false;

function toggleNewElectionForm() {
  if(isFormVisible) {
    $('#newElectionButton').show();
    $('#newElectionForm').hide();
    isFormVisible = false;
  } else {
    $('#newElectionButton').hide();
    $('#newElectionForm').show();
    isFormVisible = true;
  }
}

async function submitNewElection() {
  var details = document.getElementsByName('details[]');
  var candidateInputs = document.getElementsByName('candidates[]');
  var candidates = [];

  for (var i = 0; i < candidateInputs.length; i++) {
    candidates.push(candidateInputs[i].value);
  }
  toggleNewElectionForm();
  try {
    await ElectionData.createElection([details[0].value, details[1].value], candidates);
    document.getElementById('formData').reset();
  } catch(e) {
    document.getElementById('formData').reset();        
  }
}