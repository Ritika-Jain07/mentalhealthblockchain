let auditChart;

async function auditLogs() {
  audit.textContent = "Loading...";

  try {
    const res = await fetch("/api/audit/stats");
    const data = await res.json();

    // Show JSON
    audit.textContent = JSON.stringify(data, null, 2);

    // Extract values
    const totalLogs = Number(data.totalLogs || 0);
    const granted = data.lastAccess?.granted ? 1 : 0;
    const denied = totalLogs - granted;

    const ctx = document.getElementById("auditChart").getContext("2d");

    // Destroy old chart if exists
    if (auditChart) auditChart.destroy();

    // Create new chart
    auditChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Total Logs", "Granted", "Denied"],
        datasets: [{
          label: "Audit Activity",
          data: [totalLogs, granted, denied],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  } catch (e) {
    audit.textContent = "Error: " + e;
  }
}