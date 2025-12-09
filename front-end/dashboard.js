function toggleMenu() {
      const menu = document.getElementById('menu');
      menu.classList.toggle('-translate-x-full');
    }

    function showTicketSection() {
      toggleMenu();
      document.getElementById('historySection').classList.add('hidden');
      const section = document.getElementById('ticketSection');
      section.classList.remove('hidden');
      section.scrollIntoView({ behavior: 'smooth' });
    }

    const timeSelect = document.getElementById('tripTime');
    for (let h = 7; h <= 21; h++) {
      for (let m = 0; m < 60; m += 8) {
        const hour = h % 12 === 0 ? 12 : h % 12;
        const minute = m < 10 ? '0' + m : m;
        const ampm = h < 12 ? 'AM' : 'PM';
        timeSelect.innerHTML += `<option>${hour}:${minute} ${ampm}</option>`;
      }
    }

    function confirmTrip() {
      const from = document.getElementById('startPoint').value;
      const to = document.getElementById('endPoint').value;
      const date = document.getElementById('tripDate').value;
      const time = document.getElementById('tripTime').value;
      const type = document.getElementById('tripType').value;
      const adults = parseInt(document.getElementById('adultCount').value);
      const children = parseInt(document.getElementById('childCount').value);
      const fare = (adults * 50 + children * 25) * (type === 'Round' ? 2 : 1);

      const qrData = `From: ${from}, To: ${to}, Date: ${date}, Time: ${time}, Type: ${type}, Adults: ${adults}, Children: ${children}, Fare: BDT ${fare.toFixed(2)}`;

      document.getElementById('summaryContent').innerHTML = `
        <p><strong>From:</strong> ${from}</p>
        <p><strong>To:</strong> ${to}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Trip Type:</strong> ${type}</p>
        <p><strong>Passengers:</strong> ${adults} Adult(s), ${children} Child(ren)</p>
        <p><strong>Estimated Fare:</strong> BDT ${fare.toFixed(2)}</p>
      `;

      const qrContainer = document.getElementById('qrcode');
      qrContainer.innerHTML = "";

      new QRCode(qrContainer, {
        text: qrData,
        width: 150,
        height: 150,
        colorDark: "#006a4e",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      document.getElementById('tripOutput').classList.remove('hidden');

      const tripHistory = JSON.parse(localStorage.getItem("tripHistory")) || [];
      tripHistory.push({ from, to, fare: fare.toFixed(2), timestamp: new Date().toLocaleString() });
      localStorage.setItem("tripHistory", JSON.stringify(tripHistory));
    }

    function showHistory() {
      toggleMenu();
      document.getElementById('ticketSection').classList.add('hidden');
      const historySection = document.getElementById('historySection');
      const container = document.getElementById('historyContainer');
      historySection.classList.remove('hidden');
      historySection.scrollIntoView({ behavior: 'smooth' });

      container.innerHTML = '';
      const history = JSON.parse(localStorage.getItem('tripHistory')) || [];

      if (history.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500">No travel history available.</p>`;
        return;
      }

      history.reverse().forEach(trip => {
        const card = document.createElement('div');
        card.className = 'flex justify-between items-center text-xl font-bold bg-white border border-green-300 rounded-xl px-6 py-4 shadow hover:shadow-lg transition duration-300 hover:scale-[1.01]';
        card.innerHTML = `
          <div class="text-xl font-semibold text-gray-700">
            ${trip.from} ➝ ${trip.to} <br>
            <span class="text-2xl  font-boldtext-gray-400">${trip.timestamp}</span>
          </div>
          <div class="text-green-600 font-bold text-2xl">
            ৳ ${trip.fare}
          </div>
        `;
        container.appendChild(card);
      });
    }

   function toggleNotification() {
    const drawer = document.getElementById('notificationDrawer');
    drawer.classList.toggle('translate-x-full');
  }


function deleteNotification(button) {
  const card = button.closest('.notif-card');
  card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  card.style.transform = 'translateX(-100%)';
  card.style.opacity = '0';
  setTimeout(() => card.remove(), 300);
}


document.getElementById('payNow').addEventListener('click', function () {
  // Redirect to your real SSLCommerz gateway link
  window.open('https://sandbox.sslcommerz.com/EasyCheckout/testcde27e4c4c64942d8ce9e78fd0e5b20e', '_blank');
});

function showRechargeHistory() {
  const modal = document.getElementById('rechargeHistoryModal');
  const grid = document.getElementById('rechargeGrid');
  modal.classList.remove('hidden');

  const rechargeData = JSON.parse(localStorage.getItem("rechargeHistory")) || [];

  grid.innerHTML = '';
  if (rechargeData.length === 0) {
    grid.innerHTML = `<p class="text-xl text-gray-600 col-span-full">No recharge history found.</p>`;
    return;
  }

  rechargeData.reverse().forEach(entry => {
    const card = document.createElement('div');
    card.className = 'bg-green-50 border border-green-400 rounded-xl p-6 shadow hover:shadow-lg transition';
    card.innerHTML = `
      <p class="text-xl font-bold text-[#006a4e]">৳ ${entry.amount}</p>
      <p class="text-gray-700 text-lg">${entry.date}</p>
    `;
    grid.appendChild(card);
  });
}

function closeRechargeHistory() {
  document.getElementById('rechargeHistoryModal').classList.add('hidden');
}

