async function loadVisits() {
  try {
    const res = await fetch('/api/visits');
    const data = await res.json();
    document.getElementById('visits').innerText = data.visits;
  } catch (err) {
    document.getElementById('visits').innerText = 'Error';
    console.error(err);
  }
}

window.onload = loadVisits;
