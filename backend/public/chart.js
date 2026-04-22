// ================== GLOBAL CHART VARIABLES ==================
let chart;
let subChart;


// ================== AUDIT CHART ==================
async function auditLogs(){
  const audit = document.getElementById("audit");
  audit.textContent = "Loading...";

  try {
    const res = await fetch("/api/audit/stats");
    const data = await res.json();

    // show raw audit data
    audit.textContent = JSON.stringify(data, null, 2);

    // demo values (can replace with real later)
    let doctor = Math.floor(Math.random()*10)+1;
    let researcher = Math.floor(Math.random()*10)+1;
    let emergency = Math.floor(Math.random()*10)+1;

    const ctx = document.getElementById("auditChart").getContext("2d");

    // destroy old chart
    if(chart) chart.destroy();

    // create chart
    chart = new Chart(ctx,{
      type: "bar",
      data: {
        labels: ["Doctor","Researcher","Emergency"],
        datasets: [{
          label: "Access Attempts",
          data: [doctor, researcher, emergency],
          backgroundColor: [
            "#6366f1",
            "#22c55e",
            "#ef4444"
          ],
          borderColor: "#ffffff",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: "#ffffff" }
          }
        },
        scales: {
          x: {
            ticks: { color: "#ffffff" }
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#ffffff", stepSize: 1 }
          }
        }
      }
    });

  } catch (err) {
    audit.textContent = "Error: " + err;
  }
}


// ================== SUB-ROLE GRAPH ==================
function loadSubRoleGraph(){

  const role = document.getElementById("role").value;

  let labels = [];
  let values = [];

  if(role === "doctor"){
    labels = ["Psychiatrist","Psychologist","Therapist"];
  }
  else if(role === "researcher"){
    labels = ["MD Doctor","PhD Scholar","Clinical Analyst"];
  }
  else if(role === "emergency"){
    labels = ["Police","Ambulance","Medical Staff"];
  }
  else{
    alert("Please select a role first");
    return;
  }

  // generate demo data
  values = labels.map(() => Math.floor(Math.random()*10)+1);

  const ctx = document.getElementById("subRoleChart").getContext("2d");

  // destroy old chart
  if(subChart) subChart.destroy();

  // create pie chart
  subChart = new Chart(ctx,{
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        label: "Sub-role Activity",
        data: values,
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
          "#0ea5e9"
        ]
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#ffffff" }
        }
      }
    }
  });
}